// Creative Direction layer for the AnimMaster agent.
// Runs BEFORE any component recommendation and defines the visual language
// (profile + 10-axis personality matrix) that every subsequent pick must obey.

export type PersonalityAxis =
  | "elegance"
  | "minimalism"
  | "technology"
  | "luxury"
  | "motion"
  | "interactivity"
  | "creativity"
  | "corporate"
  | "premium"
  | "conversion";

export type PersonalityMatrix = Record<PersonalityAxis, number>; // 0..10

export type CreativeProfileId =
  | "corporate-smooth"
  | "elite-luxury"
  | "modern-saas"
  | "interactive-experience"
  | "elegant-minimal";

export type CreativeProfile = {
  id: CreativeProfileId;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  idealFor: string[];
  targetMatrix: PersonalityMatrix;
  preferredCategories: string[];
  avoidedCategories: string[];
  avoidedSlugKeywords: string[];
};

export const CREATIVE_PROFILES: CreativeProfile[] = [
  {
    id: "elegant-minimal",
    name: "Elegant Minimal",
    emoji: "🌿",
    tagline: "Poucos elementos. Muito respiro. Refinamento silencioso.",
    description:
      "Design com respiro, animações lentas e tudo extremamente refinado. Motion existe apenas para guiar o olhar.",
    idealFor: ["Wellness", "Yoga", "Arquitetura minimal", "Editorial", "Marcas de nicho"],
    targetMatrix: {
      elegance: 10, minimalism: 10, technology: 5, luxury: 7, motion: 4,
      interactivity: 4, creativity: 7, corporate: 5, premium: 8, conversion: 6,
    },
    preferredCategories: ["scroll", "text", "hero"],
    avoidedCategories: ["webgl", "shader", "3d", "particles"],
    avoidedSlugKeywords: ["glitch", "neon", "gamer", "explosion", "pixel", "vhs"],
  },
  {
    id: "corporate-smooth",
    name: "Corporate Smooth",
    emoji: "🏢",
    tagline: "Movimento discreto. Elegância. Confiança.",
    description:
      "Microinterações, scroll suave, muito espaço em branco. Sensação de confiança institucional.",
    idealFor: ["Clínicas", "Escritórios", "Advogados", "Consultoria", "Empresas B2B"],
    targetMatrix: {
      elegance: 8, minimalism: 8, technology: 6, luxury: 6, motion: 4,
      interactivity: 5, creativity: 4, corporate: 10, premium: 7, conversion: 8,
    },
    preferredCategories: ["scroll", "hover", "nav", "text", "grid"],
    avoidedCategories: ["webgl", "shader", "3d", "particles"],
    avoidedSlugKeywords: ["glitch", "neon", "gamer", "explosion", "chaos", "vhs", "distort"],
  },
  {
    id: "modern-saas",
    name: "Modern SaaS",
    emoji: "🚀",
    tagline: "Motion funcional. Microanimações. UX rápida.",
    description:
      "Hover inteligente, dashboards limpos, cards vivos. Motion serve à usabilidade, não à decoração.",
    idealFor: ["SaaS", "Ferramentas", "Fintech", "APIs", "Devtools"],
    targetMatrix: {
      elegance: 7, minimalism: 8, technology: 10, luxury: 6, motion: 6,
      interactivity: 8, creativity: 6, corporate: 6, premium: 7, conversion: 9,
    },
    preferredCategories: ["hover", "grid", "card", "nav", "text", "scroll"],
    avoidedCategories: ["shader", "3d"],
    avoidedSlugKeywords: ["vhs", "gamer", "chaos"],
  },
  {
    id: "elite-luxury",
    name: "Elite Luxury",
    emoji: "💎",
    tagline: "Cinematográfico. Parallax. WebGL. 3D. Storytelling.",
    description:
      "Hero de altíssimo impacto, motion cinematográfico, transições sofisticadas. Primeira impressão memorável.",
    idealFor: ["Marcas premium", "Estética / Harmonização", "Arquitetura", "Joalherias", "High ticket"],
    targetMatrix: {
      elegance: 10, minimalism: 6, technology: 9, luxury: 10, motion: 9,
      interactivity: 8, creativity: 9, corporate: 4, premium: 10, conversion: 8,
    },
    preferredCategories: ["webgl", "shader", "3d", "hero", "scroll", "text"],
    avoidedCategories: [],
    avoidedSlugKeywords: ["gamer", "vhs", "meme"],
  },
  {
    id: "interactive-experience",
    name: "Interactive Experience",
    emoji: "🎮",
    tagline: "Cursor. Física. Partículas. Scroll criativo.",
    description:
      "Site como experiência: cursor customizado, partículas, física, SVG animado, mouse effects criativos.",
    idealFor: ["Portfólios criativos", "Estúdios", "Agências", "Campanhas", "Landing autoral"],
    targetMatrix: {
      elegance: 7, minimalism: 4, technology: 9, luxury: 7, motion: 10,
      interactivity: 10, creativity: 10, corporate: 3, premium: 8, conversion: 6,
    },
    preferredCategories: ["mouse", "hover", "webgl", "shader", "particles", "hero", "scroll"],
    avoidedCategories: [],
    avoidedSlugKeywords: [],
  },
];

function norm(v: string): string {
  return v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

type SiteSummary = {
  url?: string;
  title?: string;
  description?: string;
  excerpt?: string;
};

function inferProfileId(site: SiteSummary | null | undefined, userText: string): CreativeProfileId {
  const blob = norm(
    [site?.title, site?.description, site?.excerpt, userText].filter(Boolean).join(" "),
  );
  const has = (words: string[]) => words.some((w) => blob.includes(w));

  if (has(["luxury", "premium", "high ticket", "sofisticad", "elite", "cinematograf"])) return "elite-luxury";
  if (has(["minimal", "minimalista", "respiro", "clean", "swiss"])) return "elegant-minimal";
  if (has(["interativ", "criativ", "portfolio", "portfólio", "agencia", "agência", "estudio", "estúdio", "campanha"])) return "interactive-experience";
  if (has(["saas", "dashboard", "api", "software", "ferramenta", "produto", "plataforma", "devtool"])) return "modern-saas";
  if (has(["clinica", "clínica", "estetica", "estética", "spa", "wellness", "dermato", "harmoniz", "joalher", "arquitet", "boutique", "grife", "moda de luxo"])) return "elite-luxury";
  if (has(["advogad", "juridic", "jurídic", "contabil", "contábil", "consultoria", "escritorio", "escritório", "b2b", "empresa"])) return "corporate-smooth";

  return "modern-saas";
}

function clamp(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n)));
}

function tuneMatrix(
  base: PersonalityMatrix,
  site: SiteSummary | null | undefined,
  userText: string,
): PersonalityMatrix {
  const blob = norm([site?.title, site?.description, site?.excerpt, userText].filter(Boolean).join(" "));
  const matrix: PersonalityMatrix = { ...base };
  const bump = (axis: PersonalityAxis, amount: number) => {
    matrix[axis] = clamp(matrix[axis] + amount);
  };

  if (/premium|luxury|elite|sofisticad|exclusiv/.test(blob)) { bump("luxury", 1); bump("premium", 1); }
  if (/rapid|rápid|conversao|conversão|venda|checkout|cta|leads?/.test(blob)) bump("conversion", 2);
  if (/minimal|clean|respiro/.test(blob)) { bump("minimalism", 2); bump("motion", -1); }
  if (/motion|animaç|animation|cinematograf/.test(blob)) bump("motion", 2);
  if (/interativ|cursor|particul|part[íi]cul/.test(blob)) bump("interactivity", 2);
  if (/b2b|corporativ|empresa|institucional/.test(blob)) { bump("corporate", 2); bump("motion", -1); }
  if (/tech|api|shader|webgl|3d/.test(blob)) bump("technology", 1);

  return matrix;
}

export type CreativeDirection = {
  profile: CreativeProfile;
  matrix: PersonalityMatrix;
  rationale: string;
  guardrails: string[];
};

export function inferCreativeDirection(
  site: SiteSummary | null | undefined,
  userText: string,
): CreativeDirection {
  const id = inferProfileId(site, userText);
  const profile = CREATIVE_PROFILES.find((p) => p.id === id)!;
  const matrix = tuneMatrix(profile.targetMatrix, site, userText);

  const brand = site?.title?.split("|")[0]?.trim() || "o projeto";
  const rationale = `${brand} recebe direção **${profile.emoji} ${profile.name}** — ${profile.tagline} Cada componente daqui pra frente é filtrado por essa direção; nada é escolhido pela beleza isolada.`;

  const guardrails = [
    "Reforça o posicionamento da marca detectada.",
    "Combina com o público-alvo, não com o gosto do agente.",
    "Ajuda a conversão (ou pelo menos não atrapalha).",
    "Mantém a identidade visual coerente com os demais componentes.",
    "Respeita o nível de sofisticação e o ritmo definidos pela matriz.",
    "Cria uma experiência consistente do hero ao footer — não uma feira de efeitos.",
  ];

  return { profile, matrix, rationale, guardrails };
}

export function scoreComponentFit(
  candidate: { slug: string; category: string; name?: string },
  direction: CreativeDirection,
): number {
  const cat = norm(candidate.category);
  const slug = norm(candidate.slug);
  const { profile, matrix } = direction;

  let score = 0;
  if (profile.preferredCategories.some((c) => cat.includes(c))) score += 6;
  if (profile.avoidedCategories.some((c) => cat.includes(c))) score -= 8;
  if (profile.avoidedSlugKeywords.some((k) => slug.includes(k))) score -= 12;

  if (/webgl|shader|3d/.test(cat)) score += (matrix.technology - 5) + (matrix.luxury - 5);
  if (/mouse|cursor|particle/.test(cat)) score += (matrix.interactivity - 5) + (matrix.creativity - 5);
  if (/scroll|text|hero/.test(cat)) score += (matrix.elegance - 5) * 0.5 + (matrix.premium - 5) * 0.5;
  if (/hover|card|grid|nav/.test(cat)) score += (matrix.conversion - 5) * 0.6 + (matrix.corporate - 5) * 0.4;
  if (matrix.minimalism >= 8 && /particle|explosion|chaos|glitch/.test(slug)) score -= 6;
  if (matrix.motion <= 4 && /wild|explosion|chaos|scatter/.test(slug)) score -= 4;

  return score;
}

export function renderDirectionMarkdown(direction: CreativeDirection): string {
  const bar = (v: number) => "█".repeat(v) + "░".repeat(10 - v);
  const axes: Array<[PersonalityAxis, string]> = [
    ["elegance", "Elegância"],
    ["minimalism", "Minimalismo"],
    ["technology", "Tecnologia"],
    ["luxury", "Luxo"],
    ["motion", "Movimento"],
    ["interactivity", "Interatividade"],
    ["creativity", "Criatividade"],
    ["corporate", "Corporate"],
    ["premium", "Premium"],
    ["conversion", "Conversão"],
  ];
  const lines = axes.map(([k, label]) => `${label.padEnd(15, " ")} ${bar(direction.matrix[k])} ${direction.matrix[k]}/10`);
  return [
    `## 🎨 Direção Criativa`,
    ``,
    `${direction.rationale}`,
    ``,
    `**Perfil:** ${direction.profile.emoji} ${direction.profile.name} — _${direction.profile.tagline}_`,
    `**Ideal para:** ${direction.profile.idealFor.join(" · ")}`,
    ``,
    "```text",
    ...lines,
    "```",
    ``,
    `### 🧭 Regras que todo componente selecionado precisa passar`,
    ...direction.guardrails.map((g) => `- ${g}`),
    ``,
  ].join("\n");
}
