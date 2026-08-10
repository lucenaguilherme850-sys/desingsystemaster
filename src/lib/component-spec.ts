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
  const techList = d.tech.length ? d.tech.join(", ") : "as tecnologias detectadas no código";
  return `# PROMPT MESTRE DE IMPLEMENTAÇÃO — "${input.name}" (${input.slug})

Você é um engenheiro sênior full-stack. Sua tarefa é **reimplementar fielmente** o componente descrito abaixo em UM projeto de destino informado pelo usuário. O código-fonte original é a fonte de verdade e está anexo ao final deste prompt.

## PRÉ-REQUISITOS
- Estude o código anexo **na íntegra** antes de escrever qualquer linha.
- Compreenda a arquitetura, hooks, refs, ciclo de animação, eventos, matemática, timings, easings, física, shaders e composição visual.
- Identifique todas as dependências (${techList}) e instale-as no projeto do usuário na versão compatível — nunca substitua por libs "equivalentes mais leves".
- Referência visual em produção: ${url}

## PERGUNTAS OBRIGATÓRIAS ANTES DE CODAR
1. Em qual página/rota do meu projeto devo montar o componente?
2. Qual conteúdo real (títulos, textos, imagens, mídia) usar no lugar da demo?
3. Devo usar os tokens/paleta/fontes atuais do meu design system ou criar tokens dedicados a esta seção?
4. Alguma restrição de performance, acessibilidade (\`prefers-reduced-motion\`) ou mobile?

Só comece a implementação depois que eu responder.

## O QUE VOCÊ DEVE PRESERVAR (INEGOCIÁVEL)
- Toda a **lógica** do componente, sem simplificações.
- Todas as **animações**, com timings, easings, delays, staggers e curvas idênticos.
- Toda a **física**, interpolações, lerps, spring configs, damping e stiffness.
- Todas as **interações** (mouse, teclado, scroll, touch, hover, drag) com a mesma resposta.
- Toda a **composição visual**: profundidade, paralaxe, iluminação, sombras, partículas, shaders, blur, glow, camadas.
- A **sensação premium** do componente: fluidez a 60fps, suavização, sincronização áudio-visual quando houver.
- A **complexidade técnica**: se o original usa WebGL, você entrega WebGL; se usa Three.js, você entrega Three.js; se usa GSAP, você entrega GSAP.

## O QUE VOCÊ PODE ADAPTAR (E SÓ ISSO)
- Cores, textos, fontes e espaçamentos, para alinhar ao design system do projeto de destino.
- Nome do arquivo/componente e organização de pastas conforme convenções do projeto.
- Integração com o roteador, providers e state management existentes.
- Ajustes mínimos de compatibilidade entre libs (versões, tipagens) — sem trocar a lib.

Essas adaptações **jamais** podem alterar o efeito principal, a identidade visual, a fluidez ou a complexidade técnica.

## PROIBIÇÕES ABSOLUTAS
- ❌ Substituir WebGL/Three.js/Shaders por CSS, SVG ou HTML.
- ❌ Substituir GSAP/Framer Motion/Lenis por \`transition\` CSS ou \`scroll-behavior: smooth\`.
- ❌ Remover partículas, luzes, câmera, paralaxe, física, blur, glow, ruído, distorção, pós-processamento.
- ❌ Reduzir FPS, simplificar loops \`requestAnimationFrame\`, cortar iterações de shader.
- ❌ Simplificar algoritmos (noise, curvas, splines, colisão, easing custom) para versões "básicas".
- ❌ Substituir canvas por \`<div>\` animada.
- ❌ Reescrever "para ficar mais limpo" removendo qualquer comportamento.

## PROCEDIMENTO DE IMPLEMENTAÇÃO
1. Fazer as 4 perguntas acima e aguardar respostas.
2. Instalar todas as dependências necessárias.
3. Recriar os arquivos anexos no projeto de destino, mantendo a mesma estrutura interna (hooks, refs, effects, loops).
4. Adaptar apenas cores/textos/fontes/espaçamentos ao design system do usuário.
5. Integrar o componente na rota/página escolhida pelo usuário.
6. Respeitar \`prefers-reduced-motion\` **somente** com um fallback que ainda represente o efeito (fade curto), nunca "sem animação".

## VALIDAÇÃO FINAL (OBRIGATÓRIA)
Ao terminar, compare lado a lado a sua implementação com a referência (${url}) e confirme:
- [ ] Mesmo comportamento em hover / scroll / mouse / touch.
- [ ] Mesma duração e curva de cada animação.
- [ ] Mesma profundidade, paralaxe, iluminação, partículas, shaders.
- [ ] Mesma fluidez percebida (60fps sustentado em desktop moderno).
- [ ] Nenhum efeito removido ou simplificado.
- [ ] Resultado visualmente **indistinguível** do original, alterando apenas cor/tipografia/cópia.

Se em algum ponto houver incompatibilidade técnica no projeto de destino, procure outra solução que **mantenha o mesmo comportamento** — nunca simplifique.

A preservação da experiência premium é o requisito mais importante desta biblioteca. Nenhuma otimização, refatoração ou adaptação pode reduzir a qualidade visual ou técnica do componente.

──────────────── CÓDIGO ORIGINAL (fonte de verdade — NÃO ALTERAR) ────────────────
${input.files.map(fence).join("")}
──────────────── FIM DO CÓDIGO ORIGINAL ────────────────`;
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