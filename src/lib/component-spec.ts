// Builds a full "Master Spec" (Portuguese) for a component made of one or
// more source files. Used by the ComponentSpec panel on the detail page so
// every item in the library ships with reusable, AI-ready documentation.

export type SpecFile = { path: string; content: string; language?: string };

export type ComponentSpecInput = {
  slug: string;
  name: string;
  category?: string | null;
  summary?: string | null;
  previewUrl?: string | null;
  files: SpecFile[];
};

type Detected = {
  tech: string[];
  deps: string[];
  hooks: string[];
  hasCanvas: boolean;
  hasSvg: boolean;
  hasShader: boolean;
};

export type ComponentSpecSummary = {
  detected: Detected;
  summary: string;
  architecture: string[];
  deps: string[];
};

const TECH_SIGNATURES: Array<{ label: string; test: RegExp }> = [
  { label: "React", test: /\bfrom\s+["']react["']|\bReact\./ },
  { label: "TypeScript", test: /\.tsx?$/ },
  { label: "Tailwind CSS", test: /className=|@apply\b|tailwind/ },
  { label: "Framer Motion", test: /from\s+["']framer-motion["']/ },
  { label: "Motion One", test: /from\s+["']motion["']|from\s+["']motion\// },
  { label: "GSAP", test: /from\s+["']gsap["']|\bgsap\./ },
  { label: "ScrollTrigger", test: /ScrollTrigger/ },
  { label: "Lenis", test: /from\s+["']@?studio-freight\/lenis["']|from\s+["']lenis["']/ },
  { label: "Three.js", test: /from\s+["']three["']/ },
  { label: "React Three Fiber", test: /@react-three\/fiber/ },
  { label: "Drei", test: /@react-three\/drei/ },
  { label: "OGL", test: /from\s+["']ogl["']/ },
  { label: "GLSL / Shaders", test: /gl_FragColor|precision\s+(?:mediump|highp)\s+float|void\s+main\s*\(\s*\)\s*\{|uniform\s+(?:float|vec|sampler)/ },
  { label: "Canvas 2D", test: /getContext\(\s*["']2d["']\s*\)/ },
  { label: "WebGL", test: /getContext\(\s*["']webgl2?["']\s*\)|WebGLRenderingContext/ },
  { label: "SVG", test: /<svg\b|xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/ },
  { label: "CSS Modules / CSS", test: /\.module\.(css|scss)|<style\b|styled\./ },
  { label: "HTML Video / Media", test: /<video\b|HTMLVideoElement/ },
  { label: "IntersectionObserver", test: /\bIntersectionObserver\b/ },
  { label: "ResizeObserver", test: /\bResizeObserver\b/ },
  { label: "requestAnimationFrame loop", test: /requestAnimationFrame/ },
  { label: "Web Animations API", test: /\.animate\(\s*\[/ },
  { label: "Zod", test: /from\s+["']zod["']/ },
  { label: "TanStack Query", test: /@tanstack\/react-query/ },
  { label: "TanStack Router", test: /@tanstack\/react-router/ },
  { label: "Supabase", test: /@supabase\/|integrations\/supabase/ },
  { label: "shadcn/ui", test: /@\/components\/ui\// },
  { label: "lucide-react", test: /from\s+["']lucide-react["']/ },
];

const HOOKS_RE = /\buse[A-Z][A-Za-z0-9_]+/g;
const IMPORT_RE = /import\s+(?:[\s\S]*?)\s+from\s+["']([^"']+)["']/g;

function detect(files: SpecFile[]): Detected {
  const combined = files.map((f) => `// ${f.path}\n${f.content}`).join("\n\n");
  const tech = new Set<string>();
  for (const sig of TECH_SIGNATURES) if (sig.test.test(combined)) tech.add(sig.label);
  if (files.some((f) => /\.tsx?$/.test(f.path))) tech.add("TypeScript");
  if (files.some((f) => /\.jsx?$/.test(f.path))) tech.add("JavaScript");

  const deps = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(combined)) !== null) {
    const src = m[1];
    if (src.startsWith(".") || src.startsWith("@/") || src.startsWith("/")) continue;
    // reduce scoped packages to "@scope/name"
    const parts = src.split("/");
    const pkg = src.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
    if (pkg) deps.add(pkg);
  }

  const hooks = new Set<string>();
  const hookMatches = combined.match(HOOKS_RE) ?? [];
  for (const h of hookMatches) hooks.add(h);

  return {
    tech: Array.from(tech).sort(),
    deps: Array.from(deps).sort(),
    hooks: Array.from(hooks).sort(),
    hasCanvas: /getContext\(\s*["']2d["']\s*\)/.test(combined),
    hasSvg: /<svg\b/.test(combined),
    hasShader: /gl_FragColor|void\s+main\s*\(/.test(combined),
  };
}

function architectureNotes(d: Detected, files: SpecFile[]): string[] {
  const notes: string[] = [];
  notes.push(
    `Composto por ${files.length} arquivo${files.length > 1 ? "s" : ""}: ${files
      .map((f) => `\`${f.path}\``)
      .join(", ")}.`,
  );
  if (d.hooks.length)
    notes.push(`Hooks React detectados: ${d.hooks.map((h) => `\`${h}\``).join(", ")}.`);
  if (d.tech.includes("requestAnimationFrame loop"))
    notes.push("Loop de animação contínuo baseado em `requestAnimationFrame` — o ciclo deve ser preservado com o mesmo passo/tempo.");
  if (d.tech.includes("IntersectionObserver"))
    notes.push("Usa `IntersectionObserver` para disparar entradas/saídas — mantenha thresholds e rootMargin exatos.");
  if (d.tech.includes("ResizeObserver"))
    notes.push("Recalcula layout via `ResizeObserver` — não trocar por listeners de resize globais.");
  if (d.hasShader)
    notes.push("Contém shaders GLSL (uniforms, precisão, main) — NUNCA substituir por CSS/JS equivalentes.");
  if (d.tech.includes("Three.js") || d.tech.includes("React Three Fiber"))
    notes.push("Cena 3D real — câmera, luzes, materiais e geometria fazem parte da identidade e devem ser preservados.");
  if (d.tech.includes("Framer Motion") || d.tech.includes("GSAP"))
    notes.push("Timings, easings e sequências de animação são parte da assinatura visual — copiar valores 1:1.");
  if (d.tech.includes("Lenis"))
    notes.push("Scroll suave via Lenis — deve continuar controlando o scroll, não trocar por `scroll-behavior: smooth`.");
  return notes;
}

function humanCategory(cat?: string | null): string {
  if (!cat) return "componente";
  return cat.replace(/[-_]/g, " ");
}

function fence(file: SpecFile): string {
  const lang = file.language || file.path.split(".").pop() || "";
  return `\n\n### \`${file.path}\`\n\n\`\`\`${lang}\n${file.content}\n\`\`\``;
}

function masterPrompt(input: ComponentSpecInput, d: Detected): string {
  const url = input.previewUrl || `https://designmaster.com.br/animmaster/${input.slug}`;
  return `# CONTEXTO DO PROJETO ALVO
- URL: https://animemaster.lovable.app/
- Marca / título: Design Master — Interactive UI Asset Catalog
- Descrição: A curated catalog of interactive UI assets: magnetic buttons, hero reveals, cursor trails, pinned galleries and more — with full technical specs and live demos.
- Posição na seleção: Componente 05
- Seção onde encaixar: **Interações**
# CAMADA DE ADAPTAÇÃO ESPECÍFICA PARA ESTE PROJETO
(esta camada é aplicada POR CIMA do Prompt Mestre original — o Prompt Mestre continua valendo integralmente)
Encaixe sugerido: **seção logo abaixo do hero (proposta de valor)** de Design Master — Interactive UI Asset Catalog (categoria "Interações").

**O que faz aqui:** trilha de partículas atrás do cursor.
**Mudança visível:** 8 pontos com fade-out escalonado seguem o movimento.
**Resultado:** assinatura visual em landing autoral.


**Onde usar:** cards de serviço / CTA de Design Master — Interactive UI Asset Catalog.
- Highlight/glow do hover em **azul institucional (#2A5BD7)** sobre fundo **branco (#FFFFFF)**.
- Manter a intensidade do efeito, mas ajustar duração para **10% mais lento para leitura confortável** (credibilidade e clareza).
- Preservar a física do cursor / lerp / spring do original.

**Manter inegociavelmente:** arquitetura da animação, shaders, easings, física, timings relativos, complexidade técnica e comportamento de interação — só cor, tipografia, copy, mídia e ritmo global mudam.
## Preservar inegociavelmente
- Arquitetura da animação (hooks, refs, loops de raf, observers).
- Shaders / WebGL / Canvas — nunca trocar por CSS ou SVG.
- Easings, timings relativos, staggers, spring configs, física.
- Comportamento de interação (mouse, scroll, hover, touch, teclado).
## Perguntar ao usuário antes de codar
1) Em qual página/rota deste projeto o componente entra?
2) Qual conteúdo real (títulos, textos, mídia) usar no lugar da demo?
3) Quais tokens de cor/tipografia usar (ou criar tokens dedicados)?
4) Restrições de mobile / prefers-reduced-motion?

  A seguir vem o PROMPT MESTRE original completo, com o código-fonte de referência — obedeça-o na íntegra e aplique a camada de adaptação acima em cima dele.
────────────────────────────────────────
# 🚀 PROMPT MESTRE DE IMPLEMENTAÇÃO: ${input.name}
> ID Referência: \`${input.slug}\`
> Link Referência: ${url}

## 🎯 OBJETIVO
Você é um Engenheiro de Software Sênior especializado em UI/UX Premium. Sua missão é **transplantar** este componente para o projeto do usuário, mantendo 100% da fidelidade visual e interativa, adaptando apenas o conteúdo e o design system (cores/fontes).

## 🛠️ STACK TÉCNICA
As seguintes tecnologias foram detectadas e devem ser garantidas no projeto de destino:
${d.tech.map((t) => `- ${t}`).join("\n")}

## 📋 PROTOCOLO DE IMPLEMENTAÇÃO (PASSO A PASSO)

### Passo 1: Preparação do Ambiente
Instale as dependências listadas acima. Não tente substituir bibliotecas de animação (ex: GSAP por CSS Transitions) pois isso destruirá a fluidez do componente.

### Passo 2: Alinhamento Estratégico
**PARE AGORA e faça estas 4 perguntas ao usuário:**
1. Em qual página ou seção específica do seu projeto devo implementar este componente?
2. Quais são os textos, títulos e imagens reais que devem substituir o conteúdo da demo?
3. Devo seguir estritamente o seu design system atual (cores, fontes, espaçamentos) ou manter a estética original da demo?
4. Existe alguma restrição de performance ou requisito de acessibilidade que eu deva considerar?

### Passo 3: Transplante de Código
Com base nas respostas, crie o componente no diretório apropriado (ex: \`src/components/...\`). Use o código original fornecido abaixo como a **Fonte Única da Verdade**.

## 💎 DIRETRIZES DE QUALIDADE PREMIUM
- **Física e Timings:** Mantenha curvas de animação, easings, damping e stiffness idênticos ao original.
- **Interação:** O feedback tátil ao mouse, scroll e toque deve ser preservado com a mesma sensibilidade.
- **Shaders/WebGL:** Se o código usa shaders, não tente "simplificá-los". Eles são o coração da estética premium.
- **Eco Mode:** Se o projeto de destino tiver um modo econômico, implemente um fallback leve, mas nunca remova a animação por completo.

## 🚫 RESTRIÇÕES ABSOLUTAS
- ❌ Não remova loops de \`requestAnimationFrame\`.
- ❌ Não simplifique a estrutura de camadas DOM/SVG.
- ❌ Não reescreva o código para "limpá-lo" se isso resultar na perda de qualquer detalhe visual.

## 📂 CÓDIGO FONTE ORIGINAL (FONTE DA VERDADE)
Abaixo estão os arquivos originais. Estude-os profundamente antes de iniciar.

${input.files.map(fence).join("")}

## ✅ CHECKLIST DE VALIDAÇÃO FINAL
Após a implementação, valide:
- [ ] O componente está rodando a 60FPS estáveis?
- [ ] O comportamento ao interagir é indistinguível da referência (${url})?
- [ ] O design system do usuário foi respeitado sem quebrar a estética do efeito?

---
*Este prompt foi gerado pelo Design Master para garantir a excelência técnica na replicação de componentes premium.*`;
}

export function buildComponentSpecSummary(input: ComponentSpecInput): ComponentSpecSummary {
  const d = detect(input.files);
  const cat = humanCategory(input.category);
  const summary =
    input.summary?.trim() ||
    `Componente da categoria "${cat}" chamado "${input.name}". Prévia oficial em ${input.previewUrl ?? `https://designmaster.com.br/animmaster/${input.slug}`}. Preserva-se aqui a implementação original completa para reuso premium.`;

  const arch = architectureNotes(d, input.files);
  const deps = d.deps.length ? d.deps : ["(nenhuma dependência externa detectada — usa apenas React + APIs nativas)"];

  return {
    detected: d,
    summary,
    architecture: arch,
    deps,
  };
}

export function buildComponentMasterPrompt(input: ComponentSpecInput): string {
  return masterPrompt(input, detect(input.files));
}

export function buildComponentPromptPreview(input: ComponentSpecInput): string {
  const d = detect(input.files);
  const url = input.previewUrl || `https://designmaster.com.br/animmaster/${input.slug}`;
  const techList = d.tech.length ? d.tech.join(", ") : "tecnologias detectadas no código";
  const fileList = input.files
    .map((file) => `- ${file.path} (${file.content.length.toLocaleString()} chars)`)
    .join("\n");

  return `# PROMPT MESTRE DE IMPLEMENTAÇÃO — "${input.name}" (${input.slug})

Você é um engenheiro sênior full-stack. Sua tarefa é reimplementar fielmente este componente em um projeto de destino informado pelo usuário.

Referência visual: ${url}
Tecnologias detectadas: ${techList}

Antes de codar, o agente deve perguntar:
1. Em qual página/rota do projeto montar o componente?
2. Qual conteúdo real substituirá a demo?
3. Deve usar o design system existente ou tokens dedicados?
4. Há restrições de performance, acessibilidade ou mobile?

Arquivos que serão incluídos integralmente no prompt copiado/baixado:
${fileList || "- nenhum arquivo disponível"}

O prompt completo inclui o código original como fonte de verdade, preservando animações, timings, interações, shaders, física, camadas e sensação premium sem simplificações.`;
}

export function buildComponentSpecMarkdown(input: ComponentSpecInput): string {
  const { detected: d, summary, architecture: arch, deps } = buildComponentSpecSummary(input);

  return `# ${input.name}

> Slug: \`${input.slug}\` · Categoria: \`${input.category ?? "—"}\`

## 1. Nome
**${input.name}**

## 2. Resumo
${summary}

## 3. Tecnologias utilizadas
${d.tech.length ? d.tech.map((t) => `- ${t}`).join("\n") : "- (não foi possível inferir automaticamente — consulte o código original abaixo)"}

## 4. Arquitetura
${arch.map((n) => `- ${n}`).join("\n")}

## 5. Dependências
${deps.map((d0) => `- \`${d0}\``).join("\n")}

## 6. Código original
> Preservado exatamente como está no projeto. Não simplificar, não remover trechos, não reescrever.
${input.files.map(fence).join("")}

## 7. Prompt Mestre de Implementação
${masterPrompt(input, d)}
`;
}

export function buildComponentSpec(input: ComponentSpecInput) {
  const summarySpec = buildComponentSpecSummary(input);
  const markdown = buildComponentSpecMarkdown(input);

  return {
    ...summarySpec,
    markdown,
    prompt: buildComponentMasterPrompt(input),
  };
}