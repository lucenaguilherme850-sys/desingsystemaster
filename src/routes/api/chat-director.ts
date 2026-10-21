import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { buildAnimasterIndex } from "@/lib/animaster-index.server";
import {
  inferCreativeDirection,
  scoreComponentFit,
  renderDirectionMarkdown,
  type CreativeDirection,
  derivePipelineState,
  buildCollection,
  renderPipelineMarkdown,
  renderCollectionMarkdown,
  type PipelineState,
  type CollectionEntry,
} from "@/lib/creative-direction";
import { findVisualMatches, decodeAttachmentToBuffer } from "@/lib/image-match.server";

const SYSTEM_BASE = `Você é o AGENTE CREATIVE DIRECTOR da AnimMaster — Direção de Arte + Design System + UX/UI + Motion + CRO condensados em um agente.

OBJETIVO: entender o projeto e recomendar componentes AnimMaster justificados por estratégia, marca, público, hierarquia e conversão.

═══ PERSONA E COMPETÊNCIAS (ENGENHARIA SENIOR) ═══

Você atua como um Engenheiro Full-Stack Sênior e Arquiteto de Software. Suas decisões são baseadas em 12 competências centrais:
1. Fundamentos (Lógica, Algoritmos, Estruturas de Dados).
2. Engenharia Web (HTML semântico, CSS avançado, Performance, Acessibilidade).
3. Bancos de Dados (Otimização de Query, PostgreSQL, Índices).
4. Cybersecurity (OWASP Top 10, Criptografia, Segurança Prática).
5. UI/UX + Design Systems (Tokens → Components → Patterns).
6. DevOps + Cloud (Linux, Docker, CI/CD, Monitoramento).
7. Arquitetura (SOLID, Clean Architecture, Escalabilidade).
8. AI Engineering (RAG, Agentes, Function Calling, Guardrails).
9. Engenharia de Software (Testes Unitários/E2E, TDD, Documentação).
10. Engenharia Reversa (Network inspection, Source maps, Debugging).
11. Pensamento de Engenharia (Investigar antes de alterar, prever erros).
12. Produto + Negócios (MVP, SaaS metrics, CAC/LTV, UX comercial).

REGRA CRÍTICA: Não recomende os mesmos componentes em todos os projetos. Cada curadoria deve ser ÚNICA e PRECISA, refletindo a marca e o objetivo técnico específico do cliente. Se um componente é "bonito" mas não faz sentido estratégico para o nicho do usuário, NÃO o recomende.

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

Emita a tabela completa de componentes somente quando houver uma seleção nova ou alteração real. Em respostas de acompanhamento sem mudanças na seleção, não repita a tabela; responda diretamente à pergunta e mantenha o relatório estruturado atualizado:

## 📦 Componentes Selecionados (Coleção Coerente)

| Status | Seção | Componente | Prioridade | Motivo Estratégico |
|--------|-------|------------|------------|-------------------|
| ✅ Selecionado | Hero | slug | Alta | ... |
| 🟡 Planejado | CTA | slug | Média | ... |
| ❌ Removido | ... | ... | ... | substituído por X |

Status: 🟡 Planejado · ✅ Selecionado · 🚧 Implementado · ❌ Removido.
Esta tabela alimenta automaticamente o dashboard e a aba "Coleção" do relatório.

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

const RateLimitSchema = z.object({
  messages: z.array(z.any()),
  threadId: z.string().uuid(),
});

type Body = z.infer<typeof RateLimitSchema>;

type LocalSiteSummary = {
  url: string;
  ok: boolean;
  status?: number;
  title?: string;
  description?: string;
  excerpt?: string;
  error?: string;
};

type LocalRecommendation = {
  section: string;
  slug: string;
  name: string;
  category: string;
  priority: "Alta" | "Média";
  reason: string;
};

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

function extractMessageText(message: UIMessage | undefined): string {
  if (!message) return "";
  const parts = Array.isArray(message.parts) ? message.parts : [];
  return parts
    .map((part) => {
      if (typeof part === "object" && part !== null && "type" in part && part.type === "text") {
        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      }
      if (typeof part === "object" && part !== null && "type" in part && part.type === "file") {
        const p = part as { filename?: string; mediaType?: string };
        const name = p.filename || "arquivo";
        const type = p.mediaType || "";
        return `[anexo: ${name}${type ? ` (${type})` : ""}]`;
      }
      return "";
    })
    .join("\n")
    .trim();
}

function hasFileAttachments(messages: UIMessage[]): boolean {
  return messages.some((m) =>
    Array.isArray(m.parts) &&
    m.parts.some((p) => typeof p === "object" && p !== null && "type" in p && p.type === "file"),
  );
}

function extractImageAttachments(messages: UIMessage[]): Array<{ url: string; filename: string; mediaType: string }> {
  const last = messages[messages.length - 1];
  if (!last || !Array.isArray(last.parts)) return [];
  const out: Array<{ url: string; filename: string; mediaType: string }> = [];
  for (const p of last.parts) {
    if (typeof p !== "object" || p === null || !("type" in p) || p.type !== "file") continue;
    const part = p as { url?: string; filename?: string; mediaType?: string };
    const mediaType = part.mediaType || "";
    if (!mediaType.startsWith("image/")) continue;
    if (!part.url) continue;
    out.push({ url: part.url, filename: part.filename || "imagem", mediaType });
  }
  return out;
}

async function buildVisualMatchBlock(
  images: Array<{ url: string; filename: string; mediaType: string }>,
): Promise<{ block: string; matched: boolean }> {
  if (images.length === 0) return { block: "", matched: false };
  const buffers: Buffer[] = [];
  for (const img of images) {
    const buf = await decodeAttachmentToBuffer(img.url);
    if (buf) buffers.push(buf);
  }
  if (buffers.length === 0) return { block: "", matched: false };
  const matches = await findVisualMatches(buffers, 3);
  if (matches.length === 0) {
    return {
      block: `\n## 🖼️ Análise da Imagem\n\n- Analisei ${images.length} imagem(ns) enviada(s) por comparação visual (perceptual hash) com o catálogo AnimMaster.\n- Nenhum componente do catálogo bateu com essa imagem — tratando como referência conversacional.\n\n`,
      matched: false,
    };
  }
  // Consider "hit" when top distance is small enough
  const best = matches[0];
  const isMatch = best.distance <= 18; // ~72% similarity
  if (!isMatch) {
    const rows = matches
      .map((m) => `| ${m.confidence}% | [${m.slug}](/animmaster/${m.slug}) | ${m.category} |`)
      .join("\n");
    return {
      block: `\n## 🖼️ Análise da Imagem\n\nNão encontrei uma correspondência forte no catálogo. Palpites mais próximos (baixa confiança):\n\n| Similaridade | Componente | Categoria |\n|---|---|---|\n${rows}\n\nSe a imagem não é de um componente AnimMaster, seguimos a conversa normalmente.\n\n`,
      matched: false,
    };
  }
  const rows = matches
    .map((m, i) => `| ${i === 0 ? "🎯" : "•"} ${m.confidence}% | [${m.slug}](/animmaster/${m.slug}) | ${m.category} | ${m.name} |`)
    .join("\n");
  return {
    block: `\n## 🖼️ Encontrei no Catálogo\n\nComparei a imagem com os posters de todos os componentes AnimMaster via **perceptual hash** local (sem IA, sem consumo de créditos).\n\n| Similaridade | Slug | Categoria | Nome |\n|---|---|---|---|\n${rows}\n\n👉 Match principal: **[${best.name}](/animmaster/${best.slug})** — abra a página para ver código, prompt e adaptar ao seu projeto.\n\n`,
    matched: true,
  };
}

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(value: string): string[] {
  const stopWords = new Set([
    "para",
    "com",
    "uma",
    "um",
    "site",
    "projeto",
    "quero",
    "preciso",
    "de",
    "do",
    "da",
    "dos",
    "das",
    "que",
    "onde",
    "como",
    "mais",
    "meu",
    "minha",
    "landing",
    "page",
  ]);
  return normalizeForSearch(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function categoryIntentBoost(category: string, text: string): number {
  const categoryValue = normalizeForSearch(category);
  const rules: Array<{ words: string[]; categories: string[]; boost: number }> = [
    { words: ["hero", "capa", "inicio", "primeira", "headline"], categories: ["hero"], boost: 8 },
    { words: ["scroll", "rolagem", "parallax", "reveal"], categories: ["scroll", "rolagem"], boost: 8 },
    { words: ["mouse", "cursor", "hover", "interacao"], categories: ["mouse", "hover"], boost: 7 },
    { words: ["texto", "titulo", "heading", "headline", "typography"], categories: ["text", "texto"], boost: 7 },
    { words: ["menu", "nav", "navegacao", "navbar"], categories: ["nav", "menu"], boost: 7 },
    { words: ["shader", "webgl", "3d", "canvas"], categories: ["webgl", "shader", "3d"], boost: 7 },
    { words: ["card", "grid", "galeria", "portfolio"], categories: ["card", "gallery", "grid"], boost: 6 },
    { words: ["cta", "conversao", "venda", "checkout", "pricing", "preco"], categories: ["cta", "pricing", "button"], boost: 6 },
  ];
  return rules.reduce((score, rule) => {
    const hasWord = rule.words.some((word) => text.includes(word));
    const hasCategory = rule.categories.some((word) => categoryValue.includes(word));
    return hasWord && hasCategory ? score + rule.boost : score;
  }, 0);
}

function getLocalRecommendations(
  index: Awaited<ReturnType<typeof buildAnimasterIndex>>,
  queryText: string,
  direction?: CreativeDirection,
): LocalRecommendation[] {
  const normalizedQuery = normalizeForSearch(queryText);
  const tokens = tokenize(queryText);
  
  // 1. Calculate base score for every item
  const scored = index
    .map((item, position) => {
      const haystack = normalizeForSearch(`${item.slug} ${item.name} ${item.category}`);
      
      // Relevance score: higher if tokens match slug/name/category
      const tokenScore = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 5 : 0), 0);
      
      // Intent score: match user intent (e.g., "hero") with category
      const categoryScore = categoryIntentBoost(item.category, normalizedQuery);
      
      // Direction score: crucial for "precision" based on visual profile
      const directionScore = direction ? scoreComponentFit(item, direction) : 0;
      
      // Position penalty: slight decay to avoid always picking the first items in DB
      // unless they are perfect matches
      const positionDecay = Math.max(-10, -Math.floor(position / 50));
      
      // Total score
      const totalScore = tokenScore + categoryScore + directionScore + positionDecay;
      
      return { item, score: totalScore };
    })
    // Filter out items that are strictly incompatible with the creative direction
    .filter((entry) => (direction ? entry.score > -15 : true))
    .sort((a, b) => b.score - a.score);

  const picked: LocalRecommendation[] = [];
  const usedSlugs = new Set<string>();
  const usedCategories = new Set<string>();

  // 2. Select top items ensuring variety and strict adherence to scoring
  for (const entry of scored) {
    if (picked.length >= 7) break;
    
    const categoryKey = normalizeForSearch(entry.item.category);
    
    // Diversity rule: try to get different categories for the first 5 picks
    // unless the score is exceptionally high (direct match)
    if (picked.length < 5 && usedCategories.has(categoryKey) && entry.score < 20) {
      continue;
    }

    if (!usedSlugs.has(entry.item.slug)) {
      usedSlugs.add(entry.item.slug);
      usedCategories.add(categoryKey);
      
      picked.push({
        section: inferSection(entry.item.category, entry.item.name),
        slug: entry.item.slug,
        name: entry.item.name,
        category: entry.item.category,
        priority: picked.length < 3 ? "Alta" : "Média",
        reason: buildRecommendationReason(entry.item.category, entry.item.slug, entry.item.name),
      });
    }
  }

  return picked;
}

function inferSection(category: string, name: string): string {
  const value = normalizeForSearch(`${category} ${name}`);
  if (/hero|headline|intro/.test(value)) return "Hero";
  if (/scroll|rolagem|reveal|parallax/.test(value)) return "Seções de rolagem";
  if (/nav|menu|dock/.test(value)) return "Navegação";
  if (/text|texto|typography|title/.test(value)) return "Títulos e copy";
  if (/mouse|hover|cursor/.test(value)) return "Interações";
  if (/pricing|price|preco/.test(value)) return "Pricing";
  if (/cta|button/.test(value)) return "CTA";
  return "Experiência visual";
}

function buildAdaptationNote(
  category: string,
  section: string,
  site: LocalSiteSummary | null | undefined,
  slug: string = "",
  position: number = 0,
): string {
  const c = normalizeForSearch(category);
  const brand = site?.title?.split("|")[0]?.trim() || "o projeto alvo";
  const profile = inferSiteProfile(site);
  const bg = profile.background;
  const accent = profile.accent;
  const feel = profile.feel;
  const speed = profile.speed;
  const eff = pickEffect(category, slug || section);
  const placements = [
    "primeira dobra (hero principal)",
    "seção logo abaixo do hero (proposta de valor)",
    "grid de serviços / cases",
    "seção de prova social / depoimentos",
    "bloco de pricing ou planos",
    "CTA final antes do footer",
    "navegação principal / header",
  ];
  const placement = placements[(hashSlug(slug || section) + position) % placements.length];

  const perCategory = (() => {
    if (c.includes("hero")) return `**Onde usar:** primeira dobra de ${brand}, sincronizado com o headline principal.\n- Trocar background por **${bg}**.\n- Trocar partículas / glow / mesh por **${accent}**.\n- Ajustar velocidade da entrada para **${speed}** para reforçar sensação de ${feel}.\n- Substituir mídia de demo por foto real do serviço (nada de stock genérico).`;
    if (c.includes("scroll")) return `**Onde usar:** seções de prova social, resultados ou serviços de ${brand}, revelando enquanto o usuário rola.\n- Fundo da seção em **${bg}**; destaques em **${accent}**.\n- Ajustar duração dos reveals para **${speed}** — precisa parecer ${feel}, não agressivo.\n- Preservar 100% a curva de easing e o trigger de scroll original.`;
    if (c.includes("hover") || c.includes("mouse")) return `**Onde usar:** cards de serviço / CTA de ${brand}.\n- Highlight/glow do hover em **${accent}** sobre fundo **${bg}**.\n- Manter a intensidade do efeito, mas ajustar duração para **${speed}** (${feel}).\n- Preservar a física do cursor / lerp / spring do original.`;
    if (c.includes("nav") || c.includes("menu")) return `**Onde usar:** navegação principal de ${brand}.\n- Barra em **${bg}** com item ativo / underline em **${accent}**.\n- Transições entre estados em **${speed}** para reforçar ${feel}.\n- Preservar 1:1 a animação de abertura/fechamento e o timing dos itens.`;
    if (c.includes("text") || c.includes("title")) return `**Onde usar:** headline principal e títulos de seção de ${brand}.\n- Texto em cor de alto contraste sobre **${bg}**; destaque de palavra-chave em **${accent}**.\n- Stagger dos caracteres/palavras em **${speed}** para transmitir ${feel}.\n- Preservar split, mask e curva de easing exatamente como no original.`;
    if (c.includes("slider")) return `**Onde usar:** galeria de antes/depois, depoimentos ou cases de ${brand}.\n- Fundo **${bg}**; controles/indicadores em **${accent}**.\n- Duração da transição em **${speed}** (${feel}).\n- Preservar drag, inércia e snap exatamente como no original.`;
    if (c.includes("3d") || c.includes("webgl") || c.includes("shader")) return `**Onde usar:** seção-âncora de destaque de ${brand} (tecnologia, resultado, manifesto).\n- Ambiente em **${bg}**; material / emissivo / luz principal puxando para **${accent}**.\n- Reduzir intensidade global em ~15% para transmitir ${feel} sem perder profundidade.\n- Preservar shaders, câmera, luzes, geometria e loop de raf 1:1 — NÃO trocar por CSS.`;
    if (c.includes("grid") || c.includes("card") || c.includes("gallery")) return `**Onde usar:** grid de serviços / cases de ${brand}.\n- Cards em **${bg}** com borda/hover em **${accent}**.\n- Stagger de entrada em **${speed}** (${feel}).\n- Preservar o padrão de entrada/saída e o IntersectionObserver.`;
    return `**Onde usar:** camada de motion premium em uma seção estratégica de ${brand}.\n- Base em **${bg}**, destaques em **${accent}**.\n- Ritmo geral em **${speed}** para reforçar ${feel}.\n- Preservar toda a arquitetura de animação original.`;
  })();

  return [
    `Encaixe sugerido: **${placement}** de ${brand} (categoria "${section}").`,
    ``,
    `**O que faz aqui:** ${eff.what}.`,
    `**Mudança visível:** ${eff.change}.`,
    `**Resultado:** ${eff.result}.`,
    ``,
    perCategory,
    ``,
    `**Manter inegociavelmente:** arquitetura da animação, shaders, easings, física, timings relativos, complexidade técnica e comportamento de interação — só cor, tipografia, copy, mídia e ritmo global mudam.`,
  ].join("\n");
}

type SiteProfile = {
  vertical: string;
  feel: string;
  background: string;
  accent: string;
  speed: string;
};

function inferSiteProfile(site?: LocalSiteSummary | null): SiteProfile {
  const raw = normalizeForSearch(
    [site?.title, site?.description, site?.excerpt].filter(Boolean).join(" "),
  );
  const match = (words: string[]) => words.some((w) => raw.includes(w));

  if (match(["clinica", "estetica", "spa", "wellness", "beleza", "dermato", "harmoniz"])) {
    return {
      vertical: "clínica/estética",
      feel: "leveza e sofisticação",
      background: "off-white / nude claro (#F7F3EE)",
      accent: "dourado fosco (#B08B57)",
      speed: "20% mais lento que o original",
    };
  }
  if (match(["fitness", "academia", "treino", "cross", "performance", "atleta"])) {
    return {
      vertical: "fitness/performance",
      feel: "energia e explosão",
      background: "preto profundo (#0A0A0A)",
      accent: "verde-limão neon (#C6FF00)",
      speed: "15% mais rápido que o original",
    };
  }
  if (match(["fintech", "banco", "cripto", "invest", "financas", "trading"])) {
    return {
      vertical: "fintech",
      feel: "confiança e precisão técnica",
      background: "grafite (#0E1116)",
      accent: "verde institucional (#00C489)",
      speed: "no tempo original, sem exageros",
    };
  }
  if (match(["saas", "software", "plataforma", "produto", "dashboard", "api"])) {
    return {
      vertical: "SaaS/produto",
      feel: "clareza e agilidade",
      background: "branco puro (#FFFFFF) ou grafite (#0F172A) em modo escuro",
      accent: "cor primária do design system (fallback #6366F1)",
      speed: "no tempo original",
    };
  }
  if (match(["moda", "fashion", "roupa", "grife", "boutique", "atelier"])) {
    return {
      vertical: "moda/luxo",
      feel: "elegância editorial",
      background: "preto (#000) ou creme (#F2EDE4)",
      accent: "champagne / cobre (#C9A97A)",
      speed: "10% mais lento, embalado",
    };
  }
  if (match(["restaurante", "gastronomia", "chef", "menu", "food", "bar"])) {
    return {
      vertical: "gastronomia",
      feel: "aconchego e desejo",
      background: "marrom escuro (#1B120C)",
      accent: "âmbar (#E6A65D)",
      speed: "no tempo original",
    };
  }
  if (match(["escola", "curso", "educacao", "ensino", "faculdade"])) {
    return {
      vertical: "educação",
      feel: "credibilidade e clareza",
      background: "branco (#FFFFFF)",
      accent: "azul institucional (#2A5BD7)",
      speed: "10% mais lento para leitura confortável",
    };
  }
  if (match(["agencia", "estudio", "studio", "creative", "criativa", "portfolio"])) {
    return {
      vertical: "agência/estúdio criativo",
      feel: "assinatura visual autoral",
      background: "preto (#0A0A0A)",
      accent: "cor de assinatura da marca (fallback magenta #FF00C8)",
      speed: "no tempo original — parte da identidade",
    };
  }
  return {
    vertical: "projeto genérico",
    feel: "coerência com a marca detectada",
    background: "token bg-background do design system",
    accent: "token bg-primary do design system",
    speed: "no tempo original",
  };
}

function buildAdaptedPromptPreamble(site: LocalSiteSummary | null, section: string, adaptation: string): string {
  const lines = [
    `# CONTEXTO DO PROJETO ALVO`,
    site?.url ? `- URL: ${site.url}` : undefined,
    site?.title ? `- Marca / título: ${site.title}` : undefined,
    site?.description ? `- Descrição: ${site.description}` : undefined,
    `- Seção onde este componente deve entrar: **${section}**`,
    ``,
    `# INSTRUÇÕES DE ADAPTAÇÃO PARA ESTE PROJETO`,
    adaptation,
    ``,
    `Antes de codar, pergunte ao usuário: 1) qual página/rota; 2) qual conteúdo real (títulos, mídia); 3) tokens de cor/fonte disponíveis; 4) restrições de mobile / prefers-reduced-motion.`,
    ``,
    `A seguir está o PROMPT MESTRE original do componente, com o código-fonte completo. NÃO simplifique, NÃO troque libs, NÃO reduza a complexidade técnica. Apenas adapte cores, tipografia e copy à marca acima.`,
    ``,
    `────────────────────────────────────────`,
    ``,
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

type EffectSig = { what: string; change: string; result: string };
const EFFECT_POOLS: Record<string, EffectSig[]> = {
  hero: [
    { what: "revela o headline em split-lines com máscara subindo", change: "cada linha entra de baixo pra cima com stagger de 80ms", result: "prende o olhar no título antes do usuário rolar" },
    { what: "anima um mesh gradiente animado atrás do headline", change: "camada WebGL de baixa opacidade respirando em loop", result: "dá profundidade sem competir com o texto" },
    { what: "faz o CTA principal ter magnetismo no cursor", change: "botão puxa levemente em direção ao mouse ao aproximar", result: "aumenta cliques por sensação de resposta física" },
    { what: "empilha badges flutuando com paralaxe suave", change: "elementos secundários com y-parallax de ±8px no scroll", result: "hero deixa de parecer estático mesmo antes do scroll" },
    { what: "faz o headline trocar palavras-chave em ciclo", change: "última palavra do H1 gira entre 3 termos com blur", result: "comunica múltiplas propostas de valor sem poluir" },
    { what: "abre a página com um portal que expande", change: "transição de entrada de 900ms cobrindo → revelando", result: "primeira impressão vira momento memorável" },
  ],
  scroll: [
    { what: "revela seções via IntersectionObserver com fade+rise", change: "cada bloco entra a 120px do viewport com 400ms ease-out", result: "ritmo de leitura fica guiado, nada aparece 'chapado'" },
    { what: "pina uma seção horizontal no scroll vertical", change: "seção fixa enquanto conteúdo rola lateralmente por 200vh", result: "cases ganham espaço narrativo sem virar carrossel" },
    { what: "aplica paralaxe multi-camada em fundo + mídia + texto", change: "3 camadas com velocidades diferentes conforme o scroll", result: "profundidade cinematográfica em seções âncora" },
    { what: "desenha SVG de linha (stroke-dasharray) no viewport", change: "traço se completa conforme o usuário rola a seção", result: "transforma um divisor comum em micro-storytelling" },
    { what: "conta números (counter) ao entrar no viewport", change: "métricas sobem de 0 até o valor final em 1.2s ease-out", result: "prova social ganha peso visual" },
  ],
  hover: [
    { what: "distorce a imagem do card com skew+scale", change: "img skew(-4deg) scale(1.05) em 350ms", result: "cards viram convites — dá vontade de clicar" },
    { what: "revela imagem B por máscara circular no cursor", change: "spotlight circular segue o mouse revelando o layer B", result: "vira demonstração 'antes/depois' sem duplicar espaço" },
    { what: "desenha underline no texto do link", change: "linha inferior anima de 0 → 100% da largura em 300ms", result: "links ficam claramente clicáveis sem visual pesado" },
    { what: "explode o texto em partículas no hover", change: "letras se separam em px scatter e voltam em 400ms", result: "microinteração premium em CTAs secundários" },
    { what: "aplica glow ring pulsante na borda do botão", change: "gradiente cônico animado em ::after do botão", result: "eleva a percepção de qualidade do CTA principal" },
  ],
  mouse: [
    { what: "cursor customizado com lerp e escala contextual", change: "bolha segue o cursor com atraso de 0.12 e cresce em áreas clicáveis", result: "sensação de site 'design studio' de alto padrão" },
    { what: "spotlight radial segue o mouse revelando cor no fundo", change: "radial-gradient de 300px acompanha o cursor sobre a hero", result: "convida à exploração sem exigir scroll" },
    { what: "trilha de partículas atrás do cursor", change: "8 pontos com fade-out escalonado seguem o movimento", result: "assinatura visual em landing autoral" },
  ],
  text: [
    { what: "quebra o headline em caracteres com stagger", change: "cada letra entra com y=20→0 e opacity 0→1 (stagger 25ms)", result: "hierarquia tipográfica ganha ritmo e leitura mais forte" },
    { what: "efeito scramble antes de estabilizar", change: "caracteres embaralhados por 600ms antes do texto final", result: "ancora atenção em números ou palavras-chave" },
    { what: "gradient sweep animado sobre o texto", change: "gradient conic com background-clip:text gira em loop", result: "destaque premium para palavra-chave sem cor chapada" },
    { what: "typewriter reverso que apaga e reescreve", change: "última palavra do título deleta e digita variações", result: "comunica múltiplas ofertas mantendo a tipografia" },
    { what: "outline → fill do texto no scroll", change: "texto começa com stroke e preenche ao entrar na view", result: "títulos de seção viram momento visual" },
  ],
  nav: [
    { what: "menu overlay em split-curtain vertical", change: "duas metades da tela deslizam do topo/base em 500ms", result: "abertura de menu vira transição, não pop-up" },
    { what: "pill que segue o item ativo com spring", change: "background pill anima entre itens (stiffness 200)", result: "navegação principal parece app nativo" },
    { what: "nav que borra o fundo no scroll (blur+shrink)", change: "backdrop-filter blur(12px) + padding reduz após 40px", result: "nav sempre legível sem cobrir conteúdo" },
    { what: "dock inferior estilo macOS com magnificação", change: "ícone sob o cursor escala 1.4x, vizinhos 1.15x", result: "navegação lúdica para portfólios / apps criativos" },
  ],
  webgl: [
    { what: "shader de plasma / aurora rodando no fundo", change: "canvas WebGL fullscreen com fragment shader em loop de raf", result: "background vira assinatura visual, impossível em CSS" },
    { what: "distorção líquida reativa ao mouse", change: "displacement map do shader responde ao cursor", result: "hero sensorial — permanência na página sobe muito" },
    { what: "campo de partículas 3D com flow field", change: "1500+ partículas seguem noise field em canvas offscreen", result: "profundidade cinematográfica sem custo de vídeo" },
    { what: "kaleidoscópio / caustics animado", change: "shader com simetria radial + tempo, cor puxada do accent", result: "seção-âncora que fica na memória" },
  ],
  grid: [
    { what: "grid revela cards em stagger diagonal", change: "cada card entra com delay = (row+col)*60ms", result: "portfólio deixa de aparecer 'tudo de uma vez'" },
    { what: "cards com tilt 3D seguindo o mouse", change: "rotateX/rotateY calculado por posição do cursor no card", result: "grid vira galeria interativa, aumenta cliques" },
    { what: "grid quebra e reorganiza no filtro (FLIP)", change: "cards animam de posição A→B com 400ms cubic-bezier", result: "filtros de portfólio ganham fluidez de app" },
  ],
  slider: [
    { what: "carrossel com drag inercial e snap", change: "arrasto responde com velocidade + snap no card mais próximo", result: "galeria mobile-first sem parecer nativa do browser" },
    { what: "empilhamento de cards estilo Tinder", change: "stack com rotação leve, top card arrasta e sai", result: "storytelling de cases um-a-um sem quebrar a página" },
  ],
};

function pickEffect(category: string, slug: string): EffectSig {
  const c = normalizeForSearch(category);
  let key: keyof typeof EFFECT_POOLS = "hero";
  if (c.includes("scroll")) key = "scroll";
  else if (c.includes("hover")) key = "hover";
  else if (c.includes("mouse") || c.includes("cursor")) key = "mouse";
  else if (c.includes("text") || c.includes("title") || c.includes("texto")) key = "text";
  else if (c.includes("nav") || c.includes("menu")) key = "nav";
  else if (c.includes("webgl") || c.includes("shader") || c.includes("3d")) key = "webgl";
  else if (c.includes("grid") || c.includes("card") || c.includes("gallery")) key = "grid";
  else if (c.includes("slider") || c.includes("carousel")) key = "slider";
  const pool = EFFECT_POOLS[key];
  return pool[hashSlug(slug) % pool.length];
}

function buildRecommendationReason(category: string, slug: string, name: string): string {
  const eff = pickEffect(category, slug);
  const label = name && name.toLowerCase() !== "pro" ? name : slug;
  return `**${label}** — ${eff.what}. **Mudança visível:** ${eff.change}. **Resultado:** ${eff.result}.`;
}

function findFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?/i);
  return match?.[0] ?? null;
}

async function fetchLocalSiteSummary(text: string): Promise<LocalSiteSummary | null> {
  const rawUrl = findFirstUrl(text);
  if (!rawUrl) return null;
  try {
    const url = normalizePublicUrl(rawUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        "User-Agent": "AnimMasterCreativeDirectorLocal/1.0",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const html = await response.text();
    const textContent = textFromHtml(html);
    const unavailable = detectUnavailableSite(`${html} ${textContent}`, response.status);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description = html
      .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
      ?.trim();
    return {
      url,
      ok: response.ok && !unavailable.siteUnavailable,
      status: response.status,
      title,
      description,
      excerpt: textContent.slice(0, 700),
      error: unavailable.siteUnavailable ? "A página pública não carregou corretamente ou retornou 404." : undefined,
    };
  } catch (error) {
    return {
      url: rawUrl,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function buildLocalDirectorReply({
  messages,
  index,
}: {
  messages: UIMessage[];
  index: Awaited<ReturnType<typeof buildAnimasterIndex>>;
}): Promise<{
  text: string;
  siteSummary: LocalSiteSummary | null;
  recommendations: LocalRecommendation[];
  direction: CreativeDirection;
  pipeline: PipelineState;
  collection: CollectionEntry[];
}> {
  const latestText = extractMessageText(messages[messages.length - 1]);
  // Aggregate the whole conversation so recommendations evolve as we learn more.
  // Recent user messages weigh more; assistant text is included lightly for continuity.
  const userTurns = messages.filter((m) => m.role === "user");
  const weightedUser = userTurns
    .map((m, i) => {
      const t = extractMessageText(m);
      const recencyWeight = Math.min(4, userTurns.length - i); // most recent counts up to 4x
      return Array.from({ length: recencyWeight }, () => t).join("\n");
    })
    .join("\n");
  const assistantTail = messages
    .filter((m) => m.role === "assistant")
    .slice(-2)
    .map(extractMessageText)
    .join("\n");
  const conversationContext = `${weightedUser}\n${assistantTail}\n${latestText}`.trim();
  // Prefer a URL from the most recent user message; fall back to older turns.
  const urlSourceText =
    [...userTurns].reverse().map(extractMessageText).find((t) => findFirstUrl(t)) || latestText;
  const siteSummary = await fetchLocalSiteSummary(urlSourceText);
  const direction = inferCreativeDirection(siteSummary, conversationContext);
  const recommendations = getLocalRecommendations(index, conversationContext, direction);
  const collection = buildCollection(index, direction, /* emotion */ (() => {
    // Local mode uses the same pipeline derivation to stay consistent.
    const pre = derivePipelineState(siteSummary, conversationContext, 0);
    return pre.emotion;
  })());
  const pipeline = derivePipelineState(siteSummary, conversationContext, collection.length);
  const categories = Array.from(new Set(index.map((item) => item.category))).sort();
  const componentRows = recommendations
    .map(
      (item) =>
        `| ${item.section} | [${item.slug}](/animmaster/${item.slug}) | ${item.priority} | ${item.reason} |`,
    )
    .join("\n");
  const selectedRows = recommendations
    .map(
      (item) =>
        `| 🟡 Planejado | ${item.section} | [${item.slug}](/animmaster/${item.slug}) | ${item.priority} | ${item.reason} |`,
    )
    .join("\n");
  const siteBlock = siteSummary
    ? siteSummary.ok
      ? `\n## 🔎 Leitura do Site\n\n- **URL:** ${siteSummary.url}\n- **Status:** ${siteSummary.status ?? "ok"}\n- **Título:** ${siteSummary.title || "não identificado"}\n- **Descrição:** ${siteSummary.description || "não identificada"}\n- **Sinal principal:** ${(siteSummary.excerpt || "").slice(0, 220) || "conteúdo curto demais para extrair contexto."}\n`
      : `\n## ⚠️ Leitura do Site\n\n- **URL:** ${siteSummary.url}\n- **Status:** ${siteSummary.status ?? "indisponível"}\n- **Problema:** ${siteSummary.error || "não foi possível carregar a página."}\n- **Ação:** envie uma URL pública funcionando ou descreva o projeto em 3-5 linhas.\n`
    : "";

  const text = `## Resumo

Modo local ativo — sem consumo de créditos externos.
${siteBlock}
## Direção recomendada

- **Objetivo visual:** ${direction.profile.name} — ${direction.profile.description}
- **Prioridade:** clareza, hierarquia e conversão; usar motion apenas quando reforçar a experiência.

## Componentes recomendados

| Seção | Componente | Prioridade | Motivo |
|---|---|---|---|
${componentRows || "| Hero | catálogo indisponível | Alta | Não encontrei componentes locais para recomendar. |"}

## Próximo passo

Escolha uma seção para aprofundar ou peça um plano de implementação. O documento lateral mantém o briefing, a coleção e o plano; não é necessário repetir tudo a cada mensagem.

> Limitação: a leitura de sites no modo local é simples e pode não capturar páginas que dependem fortemente de JavaScript. Se necessário, descreva o projeto manualmente.
`;
  return { text, siteSummary, recommendations, direction, pipeline, collection };
}

function createLocalStreamResponse(text: string): Response {
  const messageId = `local-${Date.now()}`;
  const textId = `${messageId}-text`;
  const stream = new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "start", messageId });
      controller.enqueue({ type: "text-start", id: textId });
      for (let index = 0; index < text.length; index += 900) {
        controller.enqueue({ type: "text-delta", id: textId, delta: text.slice(index, index + 900) });
      }
      controller.enqueue({ type: "text-end", id: textId });
      controller.enqueue({ type: "finish", finishReason: "stop" });
      controller.close();
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export const Route = createFileRoute("/api/chat-director")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = (await request.json()) as Body;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("Missing messages or threadId", { status: 400 });
        }
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

        // Admin-only: block non-admins from spending AI credits
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (!roleRow) {
          return new Response("Forbidden — admin only", { status: 403 });
        }

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
        const usePaidAi = process.env.ANIMMASTER_AGENT_PAID_AI === "true";
        const attachmentsPresent = hasFileAttachments(messages);
        // Local mode handles images itself via perceptual-hash catalog match.
        // Only escalate to paid AI when the operator explicitly asked for it.
        const routeToAi = usePaidAi;
        if (!routeToAi) {
          const local = await buildLocalDirectorReply({ messages, index });
          let localReply = local.text;
          if (attachmentsPresent) {
            const images = extractImageAttachments(messages);
            if (images.length > 0) {
              const { block } = await buildVisualMatchBlock(images);
              if (block) localReply = `${block}${local.text}`;
            } else {
              localReply = `> ℹ️ Recebi anexos não-imagem. O modo local só analisa imagens visualmente; PDFs/arquivos são tratados como referência textual.\n\n${local.text}`;
            }
          }
          const userMsg = messages[messages.length - 1];
          if (userMsg?.role === "user") {
            await supabase.from("agent_messages").insert({
              thread_id: threadId,
              role: "user",
              parts: userMsg.parts as never,
            });
          }
          await supabase.from("agent_messages").insert({
            thread_id: threadId,
            role: "assistant",
            parts: [{ type: "text", text: localReply }] as never,
          });
          // Persist a rich report so the sidebar renders per-component cards
          // with adaptation notes + "copy adapted master prompt" buttons.
          const sectionMap = local.recommendations.map((r, i) => ({
            section: r.section,
            componentSlug: r.slug,
            reason: r.reason,
            position: `Componente ${String(i + 1).padStart(2, "0")}`,
            componentName: r.name,
            category: r.category,
            priority: r.priority,
            adaptation: buildAdaptationNote(r.category, r.section, local.siteSummary, r.slug, i),
          }));
          const business = local.siteSummary
            ? {
                url: local.siteSummary.url,
                title: local.siteSummary.title,
                description: local.siteSummary.description,
                status: local.siteSummary.status,
                ok: local.siteSummary.ok,
                excerpt: local.siteSummary.excerpt,
                creative_direction: local.direction,
                pipeline: local.pipeline,
                collection: local.collection,
                emotion: local.pipeline.emotion,
              }
            : {
                creative_direction: local.direction,
                pipeline: local.pipeline,
                collection: local.collection,
                emotion: local.pipeline.emotion,
              };
          await supabase.from("agent_reports").upsert(
            {
              thread_id: threadId,
              business,
              brand: {},
              audience: {},
              design_system: {},
              section_map: sectionMap as never,
              implementation_plan: [],
              generated_at: new Date().toISOString(),
            },
            { onConflict: "thread_id" },
          );
          await supabase
            .from("agent_threads")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", threadId);

          return createLocalStreamResponse(localReply);
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("openai/gpt-5.5");

        // Pre-compute pipeline + collection from the current conversation so the model
        // sees a fixed decision state instead of jumping straight to recommendations.
        const preText = messages
          .filter((m) => m.role === "user")
          .map(extractMessageText)
          .join("\n");
        const preSite = await fetchLocalSiteSummary(preText);
        const preDirection = inferCreativeDirection(preSite, preText);
        const preCollection = buildCollection(index, preDirection, derivePipelineState(preSite, preText, 0).emotion);
        const prePipeline = derivePipelineState(preSite, preText, preCollection.length);
        const pipelineBriefing = [
          `\n\n═══ ESTADO ATUAL DO PIPELINE (calculado ANTES desta resposta) ═══`,
          `Emoção-alvo detectada: ${prePipeline.emotion.emoji} ${prePipeline.emotion.label}`,
          `Perfil criativo: ${preDirection.profile.emoji} ${preDirection.profile.name}`,
          `Fases:`,
          ...prePipeline.phases.map((p) => `- [${p.status}] ${p.emoji} ${p.label}: ${p.summary}`),
          ``,
          `COLEÇÃO COERENTE recomendada pelos especialistas internos (use como base — só troque um slot com justificativa):`,
          ...preCollection.map(
            (c) =>
              `- ${c.slotLabel}: ${c.slug} (fit ${c.fit}) — ${c.experts.map((e) => `${e.emoji}${e.score.toFixed(1)}`).join(" ")}`,
          ),
          ``,
          `REGRA: nunca escolha componentes soltos. Trabalhe sempre pensando na coleção acima como um kit unificado (Navbar → Hero → Feature → Gallery → Social → CTA → Footer). Antes de recomendar, avalie internamente pelos 5 especialistas (🎨 Visual, 🎬 Motion, 🏗️ DS, 📈 CRO, 💼 Brand) e cite as notas quando fizer sentido.`,
          ``,
        ].join("\n");

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
              limit: z.number().int().min(1).max(50).default(12),
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
            inputSchema: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) }),
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
              business: z.record(z.any()).optional(),
              brand: z.record(z.any()).optional(),
              audience: z.record(z.any()).optional(),
              designSystem: z.record(z.any()).optional(),
              sectionMap: z
                .array(
                  z.object({
                    section: z.string().max(100),
                    componentSlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
                    reason: z.string().max(500),
                  }),
                )
                .default([]),
              implementationPlan: z
                .array(z.object({ 
                  step: z.number().int(), 
                  title: z.string().max(100), 
                  details: z.string().max(1000) 
                }))
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
          system: SYSTEM_BASE + catalogSection + pipelineBriefing,
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
            // Always mirror the pre-computed pipeline/collection into the
            // report so the sidebar keeps the specialists + kit view fresh,
            // even when the model didn't explicitly call saveReport.
            const { data: existing } = await supabase
              .from("agent_reports")
              .select("business")
              .eq("thread_id", threadId)
              .maybeSingle();
            const business = {
              ...((existing?.business as Record<string, unknown> | null) ?? {}),
              ...(preSite
                ? {
                    url: preSite.url,
                    title: preSite.title,
                    description: preSite.description,
                    status: preSite.status,
                    ok: preSite.ok,
                    excerpt: preSite.excerpt,
                  }
                : {}),
              creative_direction: preDirection,
              pipeline: prePipeline,
              collection: preCollection,
              emotion: prePipeline.emotion,
            };
            await supabase
              .from("agent_reports")
              .upsert(
                { thread_id: threadId, business, generated_at: new Date().toISOString() },
                { onConflict: "thread_id" },
              );
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