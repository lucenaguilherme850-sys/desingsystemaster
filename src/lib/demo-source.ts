// Loads raw .tsx source of every demo at build time (Vite ?raw glob) and
// inlines the shared IG tokens so each file becomes a self-contained
// component ready to paste into any React + Tailwind project.

const RAW_DEMOS = import.meta.glob("../components/demos/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const RAW_TOKENS = import.meta.glob("../components/demos/_ig-tokens.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const TOKENS_SRC = Object.values(RAW_TOKENS)[0] ?? "";

const RAW_AM_TOKENS = import.meta.glob("../components/demos/_am-tokens.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const AM_TOKENS_SRC = Object.values(RAW_AM_TOKENS)[0] ?? "";

const RAW_FA_TOKENS = import.meta.glob("../components/demos/_followart-tokens.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const FA_TOKENS_SRC = Object.values(RAW_FA_TOKENS)[0] ?? "";

// Map "StLusionGoo" -> raw file contents
const BY_COMPONENT: Record<string, string> = {};
for (const [path, src] of Object.entries(RAW_DEMOS)) {
  const file = path.split("/").pop()!.replace(/\.tsx$/, "");
  BY_COMPONENT[file] = src;
}

const HEADER = (name: string) => `/**
 * ${name}
 * ---------------------------------------------------------------
 * Componente React auto-contido, exportado da biblioteca de efeitos.
 * Requisitos: React 18+, Tailwind CSS (opcional — usa apenas classes
 * utilitárias comuns; tokens de cor estão inlined como styles).
 * Cole em src/components/ do seu projeto e importe normalmente.
 * ---------------------------------------------------------------
 */
`;

function inlineTokens(src: string): string {
  const targets: Array<{ name: string; file: string; src: string }> = [
    { name: "IG", file: "_ig-tokens", src: TOKENS_SRC },
    { name: "AM", file: "_am-tokens", src: AM_TOKENS_SRC },
    { name: "FA", file: "_followart-tokens", src: FA_TOKENS_SRC },
  ];
  let out = src;
  const blocks: string[] = [];
  for (const t of targets) {
    const importRe = new RegExp(
      `import\\s*\\{\\s*${t.name}\\s*\\}\\s*from\\s*["']\\.\\/${t.file}["'];?\\n?`,
      "g",
    );
    if (!importRe.test(out)) continue;
    out = out.replace(importRe, "");
    const match = t.src.match(new RegExp(`export const ${t.name}[^;]+;`, "s"));
    if (match) blocks.push(match[0].replace(/^export\s+/, ""));
  }
  return blocks.length ? `${blocks.join("\n\n")}\n\n${out}` : out;
}

export function getDemoSource(componentName: string | null | undefined): string | null {
  if (!componentName) return null;
  const raw = BY_COMPONENT[componentName];
  if (!raw) return null;
  return HEADER(componentName) + inlineTokens(raw);
}

export function listDemoComponents(): string[] {
  return Object.keys(BY_COMPONENT).sort();
}