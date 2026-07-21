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
      return "";
    })
    .join("\n")
    .trim();
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
): LocalRecommendation[] {
  const normalizedQuery = normalizeForSearch(queryText);
  const tokens = tokenize(queryText);
  const scored = index
    .map((item, position) => {
      const haystack = normalizeForSearch(`${item.slug} ${item.name} ${item.category}`);
      const tokenScore = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 3 : 0), 0);
      const categoryScore = categoryIntentBoost(item.category, normalizedQuery);
      const earlyScore = Math.max(0, 4 - Math.floor(position / 40));
      return { item, score: tokenScore + categoryScore + earlyScore };
    })
    .sort((a, b) => b.score - a.score);

  const picked: LocalRecommendation[] = [];
  const usedCategories = new Set<string>();
  for (const entry of scored) {
    if (picked.length >= 7) break;
    const categoryKey = normalizeForSearch(entry.item.category);
    if (entry.score <= 0 && picked.length >= 4) continue;
    if (usedCategories.has(categoryKey) && picked.length < 4) continue;
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

function buildAdaptationNote(category: string, section: string, site?: LocalSiteSummary | null): string {
  const c = normalizeForSearch(category);
  const brand = site?.title?.split("|")[0]?.trim() || "o projeto alvo";
  const profile = inferSiteProfile(site);
  const bg = profile.background;
  const accent = profile.accent;
  const feel = profile.feel;
  const speed = profile.speed;

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
    `Encaixe: **${section}** de ${brand}.`,
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

function buildRecommendationReason(category: string, queryText: string): string {
  const categoryValue = normalizeForSearch(category);
  const query = normalizeForSearch(queryText);
  if (categoryValue.includes("hero")) return "Cria impacto imediato na primeira dobra sem depender de texto longo.";
  if (categoryValue.includes("scroll") || query.includes("rolagem")) {
    return "Aumenta ritmo de leitura e revela conteúdo no momento certo.";
  }
  if (categoryValue.includes("mouse") || categoryValue.includes("hover")) {
    return "Dá sensação premium nas áreas interativas sem poluir a interface.";
  }
  if (categoryValue.includes("text") || categoryValue.includes("texto")) {
    return "Fortalece hierarquia tipográfica e melhora lembrança da mensagem.";
  }
  if (categoryValue.includes("nav") || categoryValue.includes("menu")) {
    return "Deixa a navegação mais clara e memorável para exploração rápida.";
  }
  return "Adiciona movimento com função estratégica, não apenas decoração.";
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
}): Promise<{ text: string; siteSummary: LocalSiteSummary | null; recommendations: LocalRecommendation[] }> {
  const latestText = extractMessageText(messages[messages.length - 1]);
  const siteSummary = await fetchLocalSiteSummary(latestText);
  const recommendations = getLocalRecommendations(index, latestText);
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

  const text = `## 📋 Resumo Executivo

Modo local sem consumo de créditos ativado. A análise abaixo usa regras estratégicas + o catálogo AnimMaster salvo no projeto.
${siteBlock}
## 🧠 Estratégia

- Priorizar componentes que reforçam a primeira impressão, leitura e conversão.
- Usar motion como hierarquia visual: entrada → exploração → prova → ação.
- Evitar efeitos decorativos sem função clara na jornada.

## 🧩 Componentes Recomendados

| Seção | Componente AnimMaster | Prioridade | Motivo |
|-------|----------------------|------------|--------|
${componentRows || "| Hero | catálogo indisponível | Alta | Não encontrei componentes locais para recomendar. |"}

## 🗺️ Ordem de Implementação

1. Definir a seção principal onde o efeito entra: Hero, CTA, cards, pricing ou navegação.
2. Abrir o componente recomendado e copiar o código/documentação completa.
3. Adaptar tokens, tipografia e espaçamentos ao design system do projeto alvo.
4. Validar em mobile antes de adicionar efeitos secundários.

## 💡 Recomendações

- Para páginas comerciais, combine **1 efeito forte no Hero** + **microinterações em cards/CTA**.
- Para portfólios ou SaaS premium, use animações de rolagem com parcimônia para guiar o olhar.
- Para performance, mantenha vídeos/previews comprimidos e pause efeitos fora da viewport.

## ⚠️ Pontos de Atenção

- Esta resposta não usa IA externa; portanto, ela não consome créditos.
- A leitura de URL no modo local é simples: se o site depender muito de JavaScript, descreva o projeto manualmente para melhorar a seleção.
- Categorias disponíveis no catálogo: ${categories.slice(0, 12).join(", ")}${categories.length > 12 ? "…" : ""}.

## 🚀 Próximos Passos

Envie a seção onde quer aplicar o primeiro componente ou peça: “monte um plano para minha landing”.

## 📦 Componentes Selecionados

| Status | Seção | Componente | Prioridade | Motivo |
|--------|-------|------------|------------|--------|
${selectedRows || "| 🟡 Planejado | Hero | catálogo indisponível | Alta | Aguardando catálogo local. |"}`;
  return { text, siteSummary, recommendations };
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
        if (!usePaidAi) {
          const local = await buildLocalDirectorReply({ messages, index });
          const localReply = local.text;
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
            adaptation: buildAdaptationNote(r.category, r.section, local.siteSummary),
          }));
          const business = local.siteSummary
            ? {
                url: local.siteSummary.url,
                title: local.siteSummary.title,
                description: local.siteSummary.description,
                status: local.siteSummary.status,
                ok: local.siteSummary.ok,
                excerpt: local.siteSummary.excerpt,
              }
            : {};
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