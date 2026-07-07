// Loads raw source of hand-crafted animfx components and category templates
// via Vite's ?raw glob, plus the registry mapping. Used by the public
// /api/public/registry endpoints to serve the source of each of the 280
// animmaster components.

import { handcraftedFx, handcraftedFxPaths } from "@/animfx/registry";
import { seedFromSlug } from "@/animfx/templates/palette";

const RAW_FX = import.meta.glob("../animfx/fx/**/*.{tsx,ts}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const RAW_TEMPLATES = import.meta.glob("../animfx/templates/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const RAW_PALETTE = import.meta.glob("../animfx/templates/palette.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function fileToName(path: string): string {
  return path.split("/").pop()!.replace(/\.(tsx|ts)$/, "");
}
function fxSubpath(path: string): string {
  // path like "../animfx/fx/hero/Hero1BigType.tsx" → "hero/Hero1BigType"
  const m = path.match(/animfx\/fx\/(.+)\.(tsx|ts)$/);
  return m ? m[1] : fileToName(path);
}

const FX_BY_NAME: Record<string, string> = {};
// key can be either the filename ("Hero1BigType") or the subpath ("hero/Hero1BigType")
for (const [p, src] of Object.entries(RAW_FX)) {
  FX_BY_NAME[fileToName(p)] = src;
  FX_BY_NAME[fxSubpath(p)] = src;
}

const TPL_BY_NAME: Record<string, string> = {};
for (const [p, src] of Object.entries(RAW_TEMPLATES)) TPL_BY_NAME[fileToName(p)] = src;

const PALETTE_SRC = Object.values(RAW_PALETTE)[0] ?? "";

// Map slug -> handcrafted component name by walking the loader source.
// registry.ts uses `() => import("./fx/Name")` so we extract the last path segment.
// Use the static map (regex on loader.toString() fails after Vite transform).
const HANDCRAFTED_FILE_BY_SLUG: Record<string, string> = { ...handcraftedFxPaths };
// Guard against divergence between registry entries and static path map.
for (const slug of Object.keys(handcraftedFx)) {
  if (!(slug in HANDCRAFTED_FILE_BY_SLUG)) {
    // Falls back to matching the loader string when possible (dev only).
    const loader = handcraftedFx[slug].toString();
    const m = loader.match(/["']\.\/fx\/([A-Za-z0-9_/]+)["']/);
    if (m) HANDCRAFTED_FILE_BY_SLUG[slug] = m[1];
  }
}

const CATEGORY_TO_TEMPLATE: Record<string, string> = {
  scroll: "ScrollVariants",
  hero: "HeroVariants",
  hovers: "HoverVariants",
  hover: "HoverVariants",
  menu: "MenuVariants",
  menus: "MenuVariants",
  navs: "MenuVariants",
  mouse: "MouseVariants",
  mouseeff: "MouseVariants",
  pagetr: "TransitionVariants",
  pegetr: "TransitionVariants",
  physic: "PhysicsVariants",
  physics: "PhysicsVariants",
  sliders: "SliderVariants",
  svg: "SvgVariants",
  svgs: "SvgVariants",
  text: "TextVariants",
  webgl: "WebglVariants",
  "3d": "ThreeDVariants",
  grid: "GridVariants",
  grids: "GridVariants",
  bg: "BgVariants",
};

export type FxSourceInfo = {
  slug: string;
  kind: "handcrafted" | "template";
  componentName: string;
  files: Array<{ path: string; content: string; type: string }>;
};

export function getFxSourceForSlug(slug: string): FxSourceInfo | null {
  const handcrafted = HANDCRAFTED_FILE_BY_SLUG[slug];
  if (handcrafted && FX_BY_NAME[handcrafted]) {
    const main = FX_BY_NAME[handcrafted];
    const files: Array<{ path: string; content: string; type: string }> = [
      {
        path: `animfx/${handcrafted}.tsx`,
        content: main,
        type: "registry:component",
      },
    ];
    // Also include sibling relative imports (e.g. shared _ShaderCanvas, _useScrollProgress)
    const dir = handcrafted.includes("/") ? handcrafted.slice(0, handcrafted.lastIndexOf("/")) : "";
    const importRe = /from\s+["']\.\/([A-Za-z0-9_]+)["']/g;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = importRe.exec(main)) !== null) {
      const name = m[1];
      if (seen.has(name)) continue;
      seen.add(name);
      const key = dir ? `${dir}/${name}` : name;
      const content = FX_BY_NAME[key];
      if (content) {
        files.push({
          path: `animfx/${key}.tsx`,
          content,
          type: "registry:lib",
        });
      }
    }
    return { slug, kind: "handcrafted", componentName: handcrafted, files };
  }
  const { category, n } = seedFromSlug(slug);
  const tpl = CATEGORY_TO_TEMPLATE[category];
  if (!tpl || !TPL_BY_NAME[tpl]) return null;
  const usageHint = `// Usage:\n// import Fx from "./${tpl}";\n// <Fx seed={${n}} />\n`;
  const files: Array<{ path: string; content: string; type: string }> = [
    {
      path: `animfx/templates/${tpl}.tsx`,
      content: usageHint + TPL_BY_NAME[tpl],
      type: "registry:component",
    },
  ];
  if (PALETTE_SRC) {
    files.push({
      path: "animfx/templates/palette.ts",
      content: PALETTE_SRC,
      type: "registry:lib",
    });
  }
  return { slug, kind: "template", componentName: `${tpl}#${n}`, files };
}

export function hasFxSource(slug: string): boolean {
  return getFxSourceForSlug(slug) !== null;
}