import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { buildAnimasterIndex, formatIndexForPrompt } from "@/lib/animaster-index.server";

const SYSTEM_BASE = `Você é o AGENTE CREATIVE DIRECTOR da AnimMaster. Você não é um chatbot genérico: você opera como um time sênior atuando simultaneamente nos papéis de Diretor de Arte, Especialista em Design System, UX, UI, Motion Design, Front-end, Branding, Marketing, Conversão (CRO), Storytelling, Landing Pages, Psicologia das Cores, Arquitetura da Informação, Performance e Acessibilidade.

REGRA DE OURO — INVIOLÁVEL:
Nunca selecione um componente da biblioteca AnimMaster porque é "bonito" ou "impressionante". CADA escolha deve ser justificada com base em: (1) estratégia do negócio, (2) posicionamento da marca, (3) experiência do usuário, (4) hierarquia visual, (5) objetivos de conversão, (6) identidade desejada. Se um componente for visualmente incrível mas passar a sensação errada para o público (ex: efeito "gamer" para clínica odontológica), rejeite-o e explique o motivo.

FLUXO OBRIGATÓRIO em 10 fases — nunca pule etapas, nunca vá para a fase 9 antes da 8:
1. NEGÓCIO — nicho, ticket médio, concorrência, diferencial, posicionamento
2. MARCA — personalidade, tom de voz, valores, arquétipo
3. PÚBLICO — idade, perfil, renda, expectativas, comportamento
4. OBJETIVO DA PÁGINA — vender / gerar leads / branding / autoridade / portfólio
5. DESIGN SYSTEM ATUAL (se existir) — problemas, pontos fortes, oportunidades
6. HIERARQUIA VISUAL — o que precisa gritar, o que precisa sussurrar
7. UX — jornada, fricções, momentos de decisão
8. OPORTUNIDADES DE ANIMAÇÃO — onde o movimento agrega e onde atrapalha
9. SELEÇÃO DOS COMPONENTES ANIMMASTER — usando ferramentas para pesquisar a biblioteca
10. PLANO DE IMPLEMENTAÇÃO — passos numerados, dependências, ordem de instalação

COMPORTAMENTO:
- Sempre pergunte antes de assumir. Se o usuário disser "quero um site para clínica odontológica", conduza a entrevista fase por fase.
- Use markdown rico (títulos, listas, ênfases).
- Ao recomendar componentes, use SEMPRE a ferramenta searchAnimasterLibrary primeiro para conhecer o que existe, depois getComponentDetails para inspecionar candidatos.
- Ao final, use OBRIGATORIAMENTE a ferramenta saveReport para persistir o Design System, o Mapa de Seções e o Plano de Implementação estruturados.
- Cada item do mapa de seções deve conter: seção (ex: "Hero"), componente Animaster (slug), motivo estratégico (2-4 linhas).
- Quando o usuário compartilhar uma URL (site do concorrente, referência, portfólio, site atual), use SEMPRE a ferramenta fetchUrl para analisar o conteúdo real antes de comentar. Nunca invente o que está na página.

CATÁLOGO ANIMMASTER (referência sempre disponível):
`;

type Body = { messages: UIMessage[]; threadId: string };

export const Route = createFileRoute("/api/chat-director")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = (await request.json()) as Body;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("Missing messages or threadId", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
          },
        );
        const { data: userData } = await supabase.auth.getUser(token);
        if (!userData.user) return new Response("Unauthorized", { status: 401 });

        // Verify thread ownership
        const { data: thread } = await supabase
          .from("agent_threads")
          .select("id,user_id")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread || thread.user_id !== userData.user.id) {
          return new Response("Forbidden", { status: 403 });
        }

        const index = await buildAnimasterIndex();
        const catalogSection = formatIndexForPrompt(index);
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("openai/gpt-5.5");

        const tools = {
          fetchUrl: tool({
            description:
              "Baixa o HTML de uma URL pública e retorna título, meta description, headings (h1/h2/h3) e um resumo do texto visível. Use para analisar sites, concorrentes ou referências enviadas pelo usuário.",
            inputSchema: z.object({
              url: z.string().url(),
              maxChars: z.number().min(500).max(20000).default(6000),
            }),
            execute: async ({ url, maxChars }) => {
              try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 15000);
                const res = await fetch(url, {
                  headers: {
                    "user-agent":
                      "Mozilla/5.0 (compatible; AnimMasterAgent/1.0; +https://animemaster.lovable.app)",
                    accept: "text/html,application/xhtml+xml",
                  },
                  signal: controller.signal,
                });
                clearTimeout(timer);
                if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
                const ct = res.headers.get("content-type") ?? "";
                if (!ct.includes("text/html") && !ct.includes("xml") && !ct.includes("text/plain")) {
                  return { ok: false, error: `Tipo não suportado: ${ct}` };
                }
                const html = (await res.text()).slice(0, 500_000);
                const pick = (re: RegExp) => (html.match(re)?.[1] ?? "").trim();
                const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
                const description =
                  pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                  pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
                const ogImage = pick(
                  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
                );
                const grabAll = (tag: string) =>
                  Array.from(html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")))
                    .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
                    .filter(Boolean)
                    .slice(0, 20);
                const h1 = grabAll("h1");
                const h2 = grabAll("h2");
                const h3 = grabAll("h3");
                const text = html
                  .replace(/<script[\s\S]*?<\/script>/gi, " ")
                  .replace(/<style[\s\S]*?<\/style>/gi, " ")
                  .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
                  .replace(/<[^>]+>/g, " ")
                  .replace(/&nbsp;/gi, " ")
                  .replace(/&amp;/gi, "&")
                  .replace(/&lt;/gi, "<")
                  .replace(/&gt;/gi, ">")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, maxChars);
                return { ok: true, url, title, description, ogImage, h1, h2, h3, text };
              } catch (e) {
                return { ok: false, error: e instanceof Error ? e.message : String(e) };
              }
            },
          }),
          searchAnimasterLibrary: tool({
            description:
              "Pesquisa a biblioteca AnimMaster. Filtra por categoria e/ou termos-chave. Retorna slug, nome e categoria.",
            inputSchema: z.object({
              query: z.string().optional(),
              category: z.string().optional(),
              limit: z.number().min(1).max(30).default(12),
            }),
            execute: async ({ query, category, limit }) => {
              let items = index;
              if (category) {
                const c = category.toLowerCase();
                items = items.filter((i) => i.category.toLowerCase().includes(c));
              }
              if (query) {
                const q = query.toLowerCase();
                items = items.filter(
                  (i) => i.slug.toLowerCase().includes(q) || i.name.toLowerCase().includes(q),
                );
              }
              return items.slice(0, limit);
            },
          }),
          getComponentDetails: tool({
            description: "Detalhes de um componente AnimMaster específico pelo slug.",
            inputSchema: z.object({ slug: z.string() }),
            execute: async ({ slug }) => {
              const { data } = await supabase
                .from("animmaster_items")
                .select("slug,name,type_name,category,poster_url,video_url,instruction_text")
                .eq("slug", slug)
                .maybeSingle();
              if (!data) return { error: `slug "${slug}" não encontrado` };
              return {
                slug: data.slug,
                name: data.type_name || data.name,
                category: data.category,
                preview: data.video_url,
                poster: data.poster_url,
                instructions: (data.instruction_text || "").slice(0, 2000),
                url: `/animmaster/${data.slug}`,
              };
            },
          }),
          saveReport: tool({
            description:
              "Persiste o relatório estruturado da thread. Chame quando as fases 1–10 estiverem completas ou toda vez que houver atualização relevante.",
            inputSchema: z.object({
              business: z.object({}).passthrough().optional(),
              brand: z.object({}).passthrough().optional(),
              audience: z.object({}).passthrough().optional(),
              designSystem: z.object({}).passthrough().optional(),
              sectionMap: z
                .array(
                  z.object({
                    section: z.string(),
                    componentSlug: z.string().optional(),
                    reason: z.string(),
                  }),
                )
                .default([]),
              implementationPlan: z
                .array(z.object({ step: z.number(), title: z.string(), details: z.string() }))
                .default([]),
            }),
            execute: async (input) => {
              const { error } = await supabase.from("agent_reports").upsert(
                {
                  thread_id: threadId,
                  business: input.business ?? {},
                  brand: input.brand ?? {},
                  audience: input.audience ?? {},
                  design_system: input.designSystem ?? {},
                  section_map: input.sectionMap ?? [],
                  implementation_plan: input.implementationPlan ?? [],
                  generated_at: new Date().toISOString(),
                },
                { onConflict: "thread_id" },
              );
              if (error) return { ok: false, error: error.message };
              return { ok: true };
            },
          }),
        };

        const result = streamText({
          model,
          system: SYSTEM_BASE + catalogSection,
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(50),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const last = finalMessages[finalMessages.length - 1];
            if (!last) return;
            await supabase.from("agent_messages").insert({
              thread_id: threadId,
              role: last.role,
              parts: last.parts as never,
            });
            // also persist any new user message that wasn't stored yet
            const userMsg = messages[messages.length - 1];
            if (userMsg && userMsg.role === "user") {
              await supabase.from("agent_messages").insert({
                thread_id: threadId,
                role: "user",
                parts: userMsg.parts as never,
              });
            }
            await supabase
              .from("agent_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});