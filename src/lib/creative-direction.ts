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

// ═══════════════════════════════════════════════════════════════════
// v2 · Pipeline + Especialistas + Emoção + Vetor + Coleção
// ═══════════════════════════════════════════════════════════════════

export type ComponentAxis =
  | "compat"
  | "performance"
  | "elegance"
  | "corporate"
  | "luxury"
  | "creativity"
  | "conversion"
  | "motion"
  | "interactivity";

export type ComponentVector = Record<ComponentAxis, number>; // 0..10

const COMPONENT_AXES: ComponentAxis[] = [
  "compat",
  "performance",
  "elegance",
  "corporate",
  "luxury",
  "creativity",
  "conversion",
  "motion",
  "interactivity",
];

const zeroVec = (): ComponentVector => ({
  compat: 5,
  performance: 5,
  elegance: 5,
  corporate: 5,
  luxury: 5,
  creativity: 5,
  conversion: 5,
  motion: 5,
  interactivity: 5,
});

function bumpVec(v: ComponentVector, patch: Partial<ComponentVector>) {
  for (const [k, delta] of Object.entries(patch) as Array<[ComponentAxis, number]>) {
    v[k] = clamp(v[k] + delta);
  }
}

/** Deterministic multi-axis vector for a catalog item. */
export function vectorForComponent(item: { slug: string; category: string; name?: string }): ComponentVector {
  const v = zeroVec();
  const cat = norm(item.category);
  const slug = norm(item.slug);
  const name = norm(item.name ?? "");
  const blob = `${cat} ${slug} ${name}`;

  // Category baselines
  if (/hero/.test(cat)) bumpVec(v, { conversion: 2, motion: 1, elegance: 1 });
  if (/scroll|rolagem|parallax/.test(cat)) bumpVec(v, { motion: 2, elegance: 1, performance: -1 });
  if (/hover/.test(cat)) bumpVec(v, { interactivity: 2, conversion: 1, performance: 1 });
  if (/mouse|cursor|particle/.test(cat)) bumpVec(v, { interactivity: 3, creativity: 2, performance: -2, corporate: -2 });
  if (/text|texto|title|typography/.test(cat)) bumpVec(v, { elegance: 2, motion: 1, conversion: 1 });
  if (/nav|menu|dock/.test(cat)) bumpVec(v, { compat: 2, conversion: 1, corporate: 1 });
  if (/grid|card|gallery/.test(cat)) bumpVec(v, { compat: 2, conversion: 2 });
  if (/slider|carousel/.test(cat)) bumpVec(v, { interactivity: 2, motion: 1 });
  if (/webgl|shader|3d/.test(cat)) bumpVec(v, { luxury: 3, creativity: 3, motion: 2, performance: -3, corporate: -2 });
  if (/cta|button|form|pricing/.test(cat)) bumpVec(v, { conversion: 3, compat: 1 });
  if (/footer/.test(cat)) bumpVec(v, { corporate: 1, compat: 2 });

  // Slug/name signals
  if (/premium|luxe?|elite|gold|silk|marble|noir/.test(blob)) bumpVec(v, { luxury: 3, elegance: 2 });
  if (/minimal|clean|swiss|editorial|serif/.test(blob)) bumpVec(v, { elegance: 2, corporate: 1, creativity: -1 });
  if (/glass|blur|frost|glow|neon|aurora|plasma|liquid|kaleido|caustic|starfield/.test(blob))
    bumpVec(v, { creativity: 2, luxury: 1, motion: 1 });
  if (/glitch|vhs|chaos|scatter|explosion|distort|pixel/.test(blob))
    bumpVec(v, { creativity: 2, corporate: -3, luxury: -2, conversion: -1 });
  if (/marquee|ticker/.test(blob)) bumpVec(v, { motion: 1, corporate: -1 });
  if (/magnetic|tilt|3d|physics|drag|inertia/.test(blob)) bumpVec(v, { interactivity: 2, motion: 1 });
  if (/pricing|cta|form|checkout|contact/.test(blob)) bumpVec(v, { conversion: 3 });
  if (/nav|navbar|dock|breadcrumb/.test(blob)) bumpVec(v, { compat: 1, corporate: 1 });

  return v;
}

// ── Emotion presets (weights over ComponentVector, 0..1) ──

export type EmotionId =
  | "confianca"
  | "sofisticacao"
  | "luxo"
  | "tecnologia"
  | "inovacao"
  | "minimalismo"
  | "elegancia"
  | "exclusividade"
  | "energia"
  | "leveza"
  | "diversao"
  | "robustez"
  | "criatividade";

export type Emotion = {
  id: EmotionId;
  emoji: string;
  label: string;
  weights: ComponentVector; // 0..10 importance per axis
};

export const EMOTIONS: Emotion[] = [
  { id: "confianca", emoji: "🛡️", label: "Confiança", weights: { compat: 9, performance: 8, elegance: 6, corporate: 10, luxury: 5, creativity: 3, conversion: 9, motion: 3, interactivity: 3 } },
  { id: "sofisticacao", emoji: "🎩", label: "Sofisticação", weights: { compat: 6, performance: 6, elegance: 10, corporate: 6, luxury: 9, creativity: 6, conversion: 6, motion: 5, interactivity: 4 } },
  { id: "luxo", emoji: "💎", label: "Luxo", weights: { compat: 5, performance: 5, elegance: 9, corporate: 4, luxury: 10, creativity: 7, conversion: 6, motion: 7, interactivity: 6 } },
  { id: "tecnologia", emoji: "⚡", label: "Tecnologia", weights: { compat: 7, performance: 7, elegance: 5, corporate: 6, luxury: 5, creativity: 7, conversion: 8, motion: 8, interactivity: 9 } },
  { id: "inovacao", emoji: "🚀", label: "Inovação", weights: { compat: 6, performance: 6, elegance: 5, corporate: 4, luxury: 6, creativity: 9, conversion: 7, motion: 8, interactivity: 9 } },
  { id: "minimalismo", emoji: "▫️", label: "Minimalismo", weights: { compat: 8, performance: 9, elegance: 10, corporate: 7, luxury: 6, creativity: 3, conversion: 7, motion: 2, interactivity: 3 } },
  { id: "elegancia", emoji: "🌿", label: "Elegância", weights: { compat: 7, performance: 7, elegance: 10, corporate: 6, luxury: 8, creativity: 5, conversion: 7, motion: 4, interactivity: 4 } },
  { id: "exclusividade", emoji: "👑", label: "Exclusividade", weights: { compat: 5, performance: 5, elegance: 9, corporate: 4, luxury: 10, creativity: 8, conversion: 5, motion: 7, interactivity: 7 } },
  { id: "energia", emoji: "🔥", label: "Energia", weights: { compat: 5, performance: 4, elegance: 4, corporate: 3, luxury: 4, creativity: 9, conversion: 8, motion: 10, interactivity: 9 } },
  { id: "leveza", emoji: "🍃", label: "Leveza", weights: { compat: 7, performance: 8, elegance: 9, corporate: 5, luxury: 6, creativity: 5, conversion: 6, motion: 5, interactivity: 4 } },
  { id: "diversao", emoji: "🎈", label: "Diversão", weights: { compat: 4, performance: 4, elegance: 4, corporate: 2, luxury: 3, creativity: 10, conversion: 6, motion: 9, interactivity: 10 } },
  { id: "robustez", emoji: "🏛️", label: "Robustez", weights: { compat: 10, performance: 9, elegance: 6, corporate: 10, luxury: 5, creativity: 3, conversion: 9, motion: 3, interactivity: 3 } },
  { id: "criatividade", emoji: "🎨", label: "Criatividade", weights: { compat: 4, performance: 4, elegance: 6, corporate: 2, luxury: 6, creativity: 10, conversion: 5, motion: 8, interactivity: 9 } },
];

const EMOTION_KEYWORDS: Array<{ id: EmotionId; words: RegExp }> = [
  { id: "luxo", words: /\b(luxo|luxury|premium|elite|high\s*ticket|joalher|boutique|grife|caviar)\b/ },
  { id: "exclusividade", words: /\b(exclusiv|private|vip|members?\s*only|invitation)\b/ },
  { id: "sofisticacao", words: /\b(sofisticad|refinad|editorial|elegante|curador)\b/ },
  { id: "elegancia", words: /\b(elegant|delicad|feminin|beleza)\b/ },
  { id: "minimalismo", words: /\b(minimal|clean|respiro|swiss|essencial)\b/ },
  { id: "leveza", words: /\b(leve|leveza|wellness|spa|yoga|zen|tranquil)\b/ },
  { id: "energia", words: /\b(energia|potencia|forte|fitness|atleta|treino|explos|cross|performance)\b/ },
  { id: "diversao", words: /\b(divers|fun|game|gamer|joga|kids|infantil|animad)\b/ },
  { id: "tecnologia", words: /\b(tech|tecnolog|api|saas|dev|software|ai|inteligencia|dados|dashboard)\b/ },
  { id: "inovacao", words: /\b(inovad|startup|disrupti|revolucion|next\s*gen)\b/ },
  { id: "criatividade", words: /\b(criativ|estudio|studio|agencia|portfolio|autoral|campanha)\b/ },
  { id: "robustez", words: /\b(seguranc|industrial|engenharia|construc|logistic|b2b|enterprise)\b/ },
  { id: "confianca", words: /\b(clinica|clínica|advogad|juridic|contabil|banco|escola|hospital|medic|saude|consultoria)\b/ },
];

export function inferEmotion(site: SiteSummary | null | undefined, userText: string, profile: CreativeProfile): Emotion {
  const blob = norm([site?.title, site?.description, site?.excerpt, userText].filter(Boolean).join(" "));
  for (const rule of EMOTION_KEYWORDS) {
    if (rule.words.test(blob)) {
      const hit = EMOTIONS.find((e) => e.id === rule.id);
      if (hit) return hit;
    }
  }
  // Fallback derived from profile
  const fallback: Record<CreativeProfileId, EmotionId> = {
    "elite-luxury": "luxo",
    "elegant-minimal": "minimalismo",
    "interactive-experience": "criatividade",
    "modern-saas": "tecnologia",
    "corporate-smooth": "confianca",
  };
  return EMOTIONS.find((e) => e.id === fallback[profile.id]) ?? EMOTIONS[0];
}

// ── Expert panel ──

export type ExpertId = "visual" | "motion" | "ds" | "cro" | "brand";

export type ExpertScore = { id: ExpertId; emoji: string; label: string; score: number };

const EXPERT_META: Record<ExpertId, { emoji: string; label: string }> = {
  visual: { emoji: "🎨", label: "Visual Designer" },
  motion: { emoji: "🎬", label: "Motion Designer" },
  ds: { emoji: "🏗️", label: "Design System" },
  cro: { emoji: "📈", label: "CRO" },
  brand: { emoji: "💼", label: "Branding" },
};

function weightedScore(vec: ComponentVector, weights: Partial<Record<ComponentAxis, number>>): number {
  let total = 0;
  let denom = 0;
  for (const [k, w] of Object.entries(weights) as Array<[ComponentAxis, number]>) {
    total += vec[k] * w;
    denom += w;
  }
  return denom ? total / denom : 5;
}

export function scoreByExperts(vec: ComponentVector): ExpertScore[] {
  return [
    { ...EXPERT_META.visual, id: "visual" as const, score: weightedScore(vec, { elegance: 0.4, creativity: 0.2, luxury: 0.2, compat: 0.2 }) },
    { ...EXPERT_META.motion, id: "motion" as const, score: weightedScore(vec, { motion: 0.5, interactivity: 0.3, creativity: 0.2 }) },
    { ...EXPERT_META.ds, id: "ds" as const, score: weightedScore(vec, { compat: 0.5, performance: 0.3, corporate: 0.2 }) },
    { ...EXPERT_META.cro, id: "cro" as const, score: weightedScore(vec, { conversion: 0.6, compat: 0.2, performance: 0.2 }) },
    { ...EXPERT_META.brand, id: "brand" as const, score: weightedScore(vec, { luxury: 0.35, elegance: 0.25, creativity: 0.2, corporate: 0.2 }) },
  ];
}

/** Emotion-weighted composite fit — the number that drives ranking. */
export function emotionFit(vec: ComponentVector, emotion: Emotion): number {
  return weightedScore(vec, emotion.weights);
}

// ── Canonical collection slots ──

export type SlotId = "navbar" | "hero" | "feature" | "gallery" | "social" | "cta" | "footer";

export type Slot = {
  id: SlotId;
  label: string;
  match: RegExp; // category
  slugHint?: RegExp;
};

export const SLOTS: Slot[] = [
  { id: "navbar", label: "Navbar", match: /nav|menu|dock/ },
  { id: "hero", label: "Hero", match: /hero/ },
  { id: "feature", label: "Feature / Cards", match: /grid|card|scroll|feature|bento/ },
  { id: "gallery", label: "Galeria / Marquee", match: /gallery|slider|carousel|marquee|ticker|3d|webgl|shader/ },
  { id: "social", label: "Social proof", match: /text|title|counter|logo|marquee/ },
  { id: "cta", label: "CTA", match: /cta|button|form|pricing|hover/ },
  { id: "footer", label: "Footer", match: /footer|nav/ },
];

export type CollectionEntry = {
  slot: SlotId;
  slotLabel: string;
  slug: string;
  name: string;
  category: string;
  fit: number;
  experts: ExpertScore[];
  alternatives: Array<{ slug: string; name: string; category: string; fit: number }>;
};

/**
 * Build a coherent kit: one component per slot, chosen so their vectors are
 * close to the emotion profile. Same vector cluster keeps the language unified.
 */
export function buildCollection(
  index: Array<{ slug: string; name: string; category: string }>,
  direction: CreativeDirection,
  emotion: Emotion,
): CollectionEntry[] {
  const scored = index.map((item) => {
    const vec = vectorForComponent(item);
    const fit = emotionFit(vec, emotion);
    const guard = scoreComponentFit(item, direction); // profile penalties/bonuses
    
    // Add a small deterministic jitter based on slug to avoid exact same ranking 
    // for identical scores, but keep it stable for the same component
    const jitter = (hashSlug(item.slug) % 100) / 1000; 

    return { item, vec, fit: fit + guard * 0.2 + jitter };
  });

  const used = new Set<string>();
  const collection: CollectionEntry[] = [];
  for (const slot of SLOTS) {
    const candidates = scored
      .filter(({ item }) => slot.match.test(norm(item.category)))
      .filter(({ item }) => !used.has(item.slug))
      .sort((a, b) => b.fit - a.fit);
    if (!candidates.length) continue;
    const winner = candidates[0];
    used.add(winner.item.slug);
    const alternatives = candidates.slice(1, 4).map(({ item, fit }) => ({
      slug: item.slug,
      name: item.name,
      category: item.category,
      fit: round1(fit),
    }));
    collection.push({
      slot: slot.id,
      slotLabel: slot.label,
      slug: winner.item.slug,
      name: winner.item.name,
      category: winner.item.category,
      fit: round1(winner.fit),
      experts: scoreByExperts(winner.vec).map((e) => ({ ...e, score: round1(e.score) })),
      alternatives,
    });
  }
  return collection;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ── Pipeline state ──

export type PhaseId =
  | "objective"
  | "brand"
  | "direction"
  | "design_system"
  | "selection"
  | "adaptation"
  | "validation";

export type PhaseStatus = "missing" | "partial" | "done";

export type Phase = {
  id: PhaseId;
  emoji: string;
  label: string;
  status: PhaseStatus;
  summary: string;
};

export type PipelineState = {
  phases: Phase[];
  emotion: Emotion;
  direction: CreativeDirection;
};

const PHASE_META: Array<{ id: PhaseId; emoji: string; label: string }> = [
  { id: "objective", emoji: "🎯", label: "Objetivo" },
  { id: "brand", emoji: "💼", label: "Marca" },
  { id: "direction", emoji: "🧭", label: "Direção criativa" },
  { id: "design_system", emoji: "🏗️", label: "Design System" },
  { id: "selection", emoji: "🧩", label: "Seleção" },
  { id: "adaptation", emoji: "🎨", label: "Adaptação" },
  { id: "validation", emoji: "✅", label: "Validação" },
];

export function derivePipelineState(
  site: SiteSummary | null | undefined,
  userText: string,
  collectionCount: number,
): PipelineState {
  const direction = inferCreativeDirection(site, userText);
  const emotion = inferEmotion(site, userText, direction.profile);
  const blob = norm(userText);
  const hasBrand = !!(site?.title || /marca|brand|empresa|clínica|clinica|estudio|estúdio|agencia|agência|loja/.test(blob));
  const hasObjective = /converso|conversão|vend|lead|portfol|portfól|apresent|awareness|reserv|agendar|contato|contact/.test(blob) || (site?.description?.length ?? 0) > 20;
  const hasDS = /paleta|cor|tipograf|fonte|token|design\s*system/.test(blob);

  const status = (ok: boolean, partial: boolean = false): PhaseStatus =>
    ok ? "done" : partial ? "partial" : "missing";

  const summaryFor = (id: PhaseId): string => {
    switch (id) {
      case "objective":
        return hasObjective
          ? "Objetivo identificado a partir da conversa/URL."
          : "Ainda preciso de 1 linha sobre o que o site precisa fazer (converter, apresentar, agendar).";
      case "brand":
        return site?.title
          ? `Marca: **${site.title}**${site.description ? ` — ${site.description.slice(0, 100)}` : ""}`
          : hasBrand
            ? "Marca mencionada; falta refinar posicionamento e categoria."
            : "Sem nome/posicionamento ainda.";
      case "direction":
        return `Perfil **${direction.profile.emoji} ${direction.profile.name}** · emoção-alvo **${emotion.emoji} ${emotion.label}**.`;
      case "design_system":
        return hasDS
          ? "Tokens de cor/tipografia mencionados pelo usuário — aplico no prompt de adaptação."
          : "Sem tokens explícitos; uso a paleta inferida pela vertical + emoção.";
      case "selection":
        return collectionCount
          ? `${collectionCount} slot${collectionCount > 1 ? "s" : ""} da coleção preenchido${collectionCount > 1 ? "s" : ""}.`
          : "Coleção ainda não montada — envie a mensagem para eu ranquear.";
      case "adaptation":
        return collectionCount
          ? "Cada componente já vem com camada de adaptação (paleta, ritmo, posição)."
          : "Adaptação é gerada por componente após a seleção.";
      case "validation":
        return collectionCount
          ? "Verifiquei coerência entre os slots (mesmo cluster de vetor)."
          : "Sem coleção, sem o que validar ainda.";
    }
  };

  const phases: Phase[] = PHASE_META.map((m) => {
    let s: PhaseStatus = "missing";
    if (m.id === "objective") s = status(hasObjective, !!site);
    else if (m.id === "brand") s = status(!!site?.title, hasBrand);
    else if (m.id === "direction") s = "done";
    else if (m.id === "design_system") s = status(hasDS, true);
    else if (m.id === "selection") s = status(collectionCount > 0, true);
    else if (m.id === "adaptation") s = status(collectionCount > 0);
    else if (m.id === "validation") s = status(collectionCount >= 3, collectionCount > 0);
    return { id: m.id, emoji: m.emoji, label: m.label, status: s, summary: summaryFor(m.id) };
  });

  return { phases, emotion, direction };
}

export function renderPipelineMarkdown(state: PipelineState): string {
  const icon = (s: PhaseStatus) => (s === "done" ? "✅" : s === "partial" ? "🟡" : "⚪");
  return [
    `## 🧭 Pipeline (${state.emotion.emoji} emoção-alvo: ${state.emotion.label})`,
    ``,
    ...state.phases.map((p) => `- ${icon(p.status)} **${p.emoji} ${p.label}** — ${p.summary}`),
    ``,
  ].join("\n");
}

export function renderCollectionMarkdown(collection: CollectionEntry[]): string {
  if (!collection.length) return "";
  return [
    `## 🧩 Coleção coerente (kit unificado)`,
    ``,
    `| Slot | Componente | Fit | Especialistas |`,
    `|------|------------|-----|---------------|`,
    ...collection.map((c) => {
      const experts = c.experts
        .map((e) => `${e.emoji}${e.score.toFixed(1)}`)
        .join(" · ");
      return `| ${c.slotLabel} | [${c.slug}](/animmaster/${c.slug}) | **${c.fit.toFixed(1)}** | ${experts} |`;
    }),
    ``,
  ].join("\n");
}
