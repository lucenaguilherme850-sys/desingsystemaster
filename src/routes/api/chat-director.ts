import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { buildAnimasterIndex } from "@/lib/animaster-index.server";

const SYSTEM_BASE = `Você é o AGENTE CREATIVE DIRECTOR da AnimMaster — Direção de Arte + Design System + UX/UI + Motion + CRO condensados em um agente.

OBJETIVO: entender o projeto e recomendar componentes AnimMaster justificados por estratégia, marca, público, hierarquia e conversão.

═══ REGRAS DE COMUNICAÇÃO (PRIORIDADE MÁXIMA) ═══

Toda resposta deve ser VISUAL e ESCANEÁVEL. NUNCA paredões de texto.
Use títulos, subtítulos, listas, tabelas e espaçamento. O usuário deve entender em segundos.
Sem preâmbulos ("Ótima pergunta", "Como Diretor..."). Sem repetir contexto já dito. Sem narrar chamadas de ferramenta.

ESTRUTURA PADRÃO (use as seções que fizerem sentido no turno — não force todas):

## 📋 Resumo Executivo
2-3 linhas com o objetivo da solução.

## 🎯 Objetivos do Projeto
Bullets curtos.

## 🧠 Estratégia
Lógica por trás das decisões, em bullets.

## 🧩 Componentes Recomendados
Tabela obrigatória quando recomendar componentes:

| Seção | Componente AnimMaster | Prioridade | Motivo |
|-------|----------------------|------------|--------|
| Hero  | slug-do-componente   | Alta       | 1 linha estratégica |

## 🗺️ Ordem de Implementação
Lista numerada.

## 💡 Recomendações
Melhorias importantes.

## ⚠️ Pontos de Atenção
Riscos, conflitos, gaps.

## 🚀 Próximos Passos
O que fazer agora.

═══ LISTA VIVA DE COMPONENTES DO PROJETO ═══

Sempre que recomendar/substituir/remover um componente, RE-EMITA no final da resposta a tabela atualizada:

## 📦 Componentes Selecionados

| Status | Seção | Componente | Prioridade | Motivo |
|--------|-------|------------|------------|--------|
| ✅ Selecionado | Hero | slug | Alta | ... |
| 🟡 Planejado | CTA | slug | Média | ... |
| ❌ Removido | ... | ... | ... | substituído por X |

Status possíveis: 🟡 Planejado · ✅ Selecionado · 🚧 Implementado · ❌ Removido.
Mantenha a lista consistente com turnos anteriores — não perca itens já aprovados.

═══ MEMÓRIA DE PROJETO ═══

Mantenha internamente: tipo de projeto, objetivos, público, estilo visual, componentes escolhidos/descartados + justificativa, tecnologias, design system, paleta, tipografia, bibliotecas. Toda nova recomendação deve respeitar esse contexto e evitar repetições/conflitos.

═══ FLUXO INTERNO (bússola, NÃO script visível) ═══
negócio → marca → público → objetivo → DS atual → hierarquia → UX → oportunidades de animação → seleção → plano.
Avance naturalmente. Não anuncie fases, não numere etapas na resposta.

═══ FERRAMENTAS ═══
- fetchUrl: sempre que houver URL. Se ok:false/siteUnavailable/publicSiteNotFound → informe em 1 linha e peça URL correta. Não invente análise.
- searchAnimasterLibrary + getComponentDetails: use ANTES de recomendar qualquer componente.
- saveReport: chame silenciosamente quando tiver DS + mapa de seções + plano consolidados.

Aja como Diretor de Arte sênior revisando o projeto — facilite decisão, não descreva possibilidades.

CATÁLOGO ANIMMASTER: use SEMPRE a tool searchAnimasterLibrary para descobrir componentes (filtre por category + query). Nunca invente slugs. Use getComponentDetails antes de recomendar.
`;

type Body = { messages: UIMessage[]; threadId: string };

type ScrapeFormats = Array<string>;

type FirecrawlScrapeResult = {
  data?: Record<string, unknown>;
  markdown?: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  links?: string[];
  branding?: unknown;
};

function normalizePublicUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  return parsed.toString();
}

function textFromHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function detectUnavailableSite(text: string, status?: number) {
  const value = text.toLowerCase();
  const lovableNotFound = value.includes("no lovable project found at this address");
  const projectNotFound = value.includes("project not found");
  const appError =
    value.includes("esta página não carregou") ||
    value.includes("algo deu errado") ||
    value.includes("this page could not be loaded") ||
    value.includes("application error") ||
    value.includes("failed to load");

  return {
    publicSiteNotFound: lovableNotFound || (status === 404 && projectNotFound),
    appError,
    siteUnavailable: lovableNotFound || projectNotFound || appError || status === 404,
  };
}

type ErrorLikeRecord = Record<string, unknown>;

function asErrorRecord(value: unknown): ErrorLikeRecord | null {
  return typeof value === "object" && value !== null ? (value as ErrorLikeRecord) : null;
}

function readString(value: unknown, key: string): string | undefined {
  const record = asErrorRecord(value);
  const result = record?.[key];
  return typeof result === "string" ? result : undefined;
}

function readNumber(value: unknown, key: string): number | undefined {
  const record = asErrorRecord(value);
  const result = record?.[key];
  return typeof result === "number" ? result : undefined;
}

function collectErrorText(error: unknown): string {
  const cause = asErrorRecord(error)?.cause;
  const parts = [
    error instanceof Error ? error.message : undefined,
    readString(error, "message"),
    readString(error, "responseBody"),
    readString(error, "body"),
    cause instanceof Error ? cause.message : undefined,
    readString(cause, "message"),
    readString(cause, "responseBody"),
  ];

  return parts.filter(Boolean).join("\n");
}

function collectErrorStatus(error: unknown): number | undefined {
  const cause = asErrorRecord(error)?.cause;
  return (
    readNumber(error, "statusCode") ??
    readNumber(error, "status") ??
    readNumber(cause, "statusCode") ??
    readNumber(cause, "status")
  );
}

function getReadableAiError(error: unknown): string {
  const status = collectErrorStatus(error);
  const text = collectErrorText(error);
  const normalized = text.toLowerCase();

  if (status === 402 || /insufficient credits|payment required|billing|credits? exhausted|sem créditos/.test(normalized)) {
    return "Créditos de IA insuficientes. Adicione créditos em Settings → Plans & credits e envie a mensagem novamente.";
  }

  if (status === 429 || /rate limit|too many requests|limite de uso/.test(normalized)) {
    return "Limite temporário de IA atingido. Aguarde alguns instantes e tente enviar novamente.";
  }

  if (status === 401 || status === 403 || /unauthorized|forbidden|invalid api key/.test(normalized)) {
    return "A sessão ou a chave de IA não foi autorizada. Recarregue a página, entre novamente e tente outra vez.";
  }

  if (/abort|timeout|timed out|network|fetch failed/.test(normalized)) {
    return "A resposta demorou demais ou a conexão caiu. Tente enviar novamente com uma mensagem mais curta.";
  }

  if (/context_length|maximum context|token limit|too many tokens/.test(normalized)) {
    return "A mensagem ficou grande demais para o modelo. Envie uma versão mais curta ou divida a análise em partes.";
  }

  return text.trim() || "Falha ao gerar resposta do agente. Tente novamente.";
}

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
        const categories = Array.from(new Set(index.map((i) => i.category))).sort();
        const catalogSection = `\n\nCategorias disponíveis (${index.length} componentes no total):\n${categories.map((c) => `- ${c}`).join("\n")}`;
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("openai/gpt-5.5");

        const tools = {
          fetchUrl: tool({
            description:
              "Analisa uma URL pública via Firecrawl. Retorna markdown limpo, título, descrição, links principais e (opcional) identidade de marca (cores, fontes, logo). Use para analisar sites do usuário, concorrentes ou referências.",
            inputSchema: z.object({
              url: z.string(),
              maxChars: z.number().default(8000),
              includeBranding: z.boolean().default(true),
            }),
            execute: async ({ url, maxChars, includeBranding }) => {
              try {
                const normalizedUrl = normalizePublicUrl(url);
                const safeMaxChars = Math.min(Math.max(Number(maxChars) || 8000, 500), 20000);
                const lovableKey = process.env.LOVABLE_API_KEY;
                const fcKey = process.env.FIRECRAWL_API_KEY;
                const fetchDirectFallback = async (reason: string) => {
                  const directController = new AbortController();
                  const directTimer = setTimeout(() => directController.abort(), 20000);
                  try {
                    const direct = await fetch(normalizedUrl, {
                      headers: {
                        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
                        "User-Agent":
                          "Mozilla/5.0 (compatible; AnimMasterCreativeDirector/1.0; +https://animemaster.lovable.app)",
                      },
                      redirect: "follow",
                      signal: directController.signal,
                    });
                    const html = await direct.text();
                    const text = textFromHtml(html);
                    const unavailable = detectUnavailableSite(`${html} ${text}`, direct.status);
                    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
                    const description = html
                      .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
                      ?.trim();

                    if (unavailable.siteUnavailable) {
                      return {
                        ok: false,
                        url: normalizedUrl,
                        status: direct.status,
                        finalUrl: direct.url,
                        siteUnavailable: true,
                        publicSiteNotFound: unavailable.publicSiteNotFound,
                        appError: unavailable.appError,
                        error: unavailable.publicSiteNotFound
                          ? "A URL pública retornou 404: No Lovable project found at this address. O domínio parece não estar publicado, foi removido ou foi digitado errado."
                          : "A página pública não carregou corretamente.",
                        observedContent: text.slice(0, 800),
                        fallbackReason: reason,
                      };
                    }

                    return {
                      ok: direct.ok,
                      url: normalizedUrl,
                      status: direct.status,
                      finalUrl: direct.url,
                      title,
                      description,
                      markdown: text.slice(0, safeMaxChars),
                      warning: direct.ok
                        ? `Análise feita por fallback HTTP direto porque ${reason}. Pode faltar conteúdo renderizado por JavaScript.`
                        : `Fallback HTTP retornou status ${direct.status}.`,
                    };
                  } finally {
                    clearTimeout(directTimer);
                  }
                };

                if (!fcKey) {
                  return fetchDirectFallback("Firecrawl não está configurado no runtime");
                }
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 45000);
                const formats: Array<string> = ["markdown", "links", "summary"];
                if (includeBranding) formats.push("branding");
                const gatewayMode = fcKey.startsWith("lovc_");
                if (gatewayMode && !lovableKey) {
                  return fetchDirectFallback("a chave do gateway do Firecrawl não está disponível");
                }
                const firecrawlEndpoint = gatewayMode
                  ? "https://connector-gateway.lovable.dev/firecrawl/v2/scrape"
                  : "https://api.firecrawl.dev/v2/scrape";
                const firecrawlHeaders: Record<string, string> = {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${gatewayMode ? lovableKey : fcKey}`,
                };
                if (gatewayMode) {
                  firecrawlHeaders["X-Connection-Api-Key"] = fcKey;
                }
                const res = await fetch(firecrawlEndpoint, {
                  method: "POST",
                  headers: firecrawlHeaders,
                  body: JSON.stringify({
                    url: normalizedUrl,
                    formats,
                    onlyMainContent: true,
                    waitFor: 4000,
                    mobile: false,
                    blockAds: true,
                  }),
                  signal: controller.signal,
                });
                clearTimeout(timer);
                const raw = await res.text();
                if (!res.ok) {
                  return fetchDirectFallback(`Firecrawl retornou status ${res.status}: ${raw.slice(0, 240)}`);
                }
                const json = JSON.parse(raw) as FirecrawlScrapeResult;
                const d = (json.data ?? json) as Record<string, unknown>;
                const md = (d.markdown as string | undefined) ?? "";
                const meta = (d.metadata as Record<string, unknown> | undefined) ?? {};
                const statusCode = typeof meta.statusCode === "number" ? meta.statusCode : undefined;
                const links = Array.isArray(d.links)
                  ? (d.links as string[]).slice(0, 30)
                  : [];
                // Detecta páginas de erro/SPA que não hidrataram e tenta novamente com espera maior
                const unavailable = detectUnavailableSite(
                  `${md} ${String(meta.title ?? "")} ${String(meta.description ?? "")}`,
                  statusCode,
                );
                if (unavailable.siteUnavailable) {
                  return fetchDirectFallback("Firecrawl capturou uma página pública indisponível ou de erro");
                }
                const looksBroken =
                  md.length < 400 ||
                  /não carregou|algo deu errado|voltar ao início|application error|failed to load/i.test(
                    md,
                  );
                if (looksBroken) {
                  const retryController = new AbortController();
                  const retryTimer = setTimeout(() => retryController.abort(), 60000);
                  const retry = await fetch(firecrawlEndpoint, {
                    method: "POST",
                    headers: firecrawlHeaders,
                    body: JSON.stringify({
                      url: normalizedUrl,
                      formats,
                      onlyMainContent: false,
                      waitFor: 10000,
                      blockAds: true,
                    }),
                    signal: retryController.signal,
                  });
                  clearTimeout(retryTimer);
                  if (retry.ok) {
                    const rj = (await retry.json()) as { data?: Record<string, unknown> } & Record<
                      string,
                      unknown
                    >;
                    const rd = (rj.data ?? rj) as Record<string, unknown>;
                    const rmd = (rd.markdown as string | undefined) ?? "";
                    const rmeta = (rd.metadata as Record<string, unknown> | undefined) ?? {};
                    const retryUnavailable = detectUnavailableSite(
                      `${rmd} ${String(rmeta.title ?? "")} ${String(rmeta.description ?? "")}`,
                      typeof rmeta.statusCode === "number" ? rmeta.statusCode : undefined,
                    );
                    if (retryUnavailable.siteUnavailable) {
                      return fetchDirectFallback("a segunda tentativa do Firecrawl também capturou erro público");
                    }
                    if (rmd.length > md.length) {
                      return {
                        ok: true,
                        url: normalizedUrl,
                        retriedWithLongerWait: true,
                        title: rmeta.title,
                        description: rmeta.description,
                        summary: rd.summary,
                        branding: includeBranding ? rd.branding : undefined,
                        links: Array.isArray(rd.links)
                          ? (rd.links as string[]).slice(0, 30)
                          : [],
                        markdown: rmd.slice(0, safeMaxChars),
                      };
                    }
                  }
                }
                return {
                  ok: true,
                  url: normalizedUrl,
                  title: meta.title,
                  description: meta.description,
                  language: meta.language,
                  summary: d.summary,
                  branding: includeBranding ? d.branding : undefined,
                  links,
                  markdown: md.slice(0, safeMaxChars),
                  warning: looksBroken
                    ? "A página parece não ter carregado completamente (possível SPA sem SSR ou erro de deploy). Peça ao usuário para confirmar se o site está no ar."
                    : undefined,
                };
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
              limit: z.number().default(12),
            }),
            execute: async ({ query, category, limit }) => {
              const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 30);
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
              return items.slice(0, safeLimit);
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
          providerOptions: {
            lovable: { service_tier: "priority" },
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onError: getReadableAiError,
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