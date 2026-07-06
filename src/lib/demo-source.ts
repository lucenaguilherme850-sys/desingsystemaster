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
  // Remove `import { IG } from "./_ig-tokens";` (aspas simples ou duplas)
  const importRe = /import\s*\{\s*IG\s*\}\s*from\s*["']\.\/_ig-tokens["'];?\n?/g;
  if (!importRe.test(src)) return src;
  const cleaned = src.replace(importRe, "");
  // Extrai apenas o objeto `export const IG = { ... } as const;` do arquivo de tokens
  const match = TOKENS_SRC.match(/export const IG[^;]+;/s);
  const tokensBlock = match ? match[0].replace(/^export\s+/, "") : "";
  return `${tokensBlock}\n\n${cleaned}`;
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