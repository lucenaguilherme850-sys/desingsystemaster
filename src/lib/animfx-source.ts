// Loads raw source of hand-crafted animfx components and category templates
// via Vite's ?raw glob, plus the registry mapping. Used by the public
// /api/public/registry endpoints to serve the source of each of the 280
// animmaster components.

import { handcraftedFx } from "@/animfx/registry";
import { seedFromSlug } from "@/animfx/templates/palette";

const RAW_FX = import.meta.glob("../animfx/fx/*.tsx", {
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

const FX_BY_NAME: Record<string, string> = {};
for (const [p, src] of Object.entries(RAW_FX)) FX_BY_NAME[fileToName(p)] = src;

const TPL_BY_NAME: Record<string, string> = {};
for (const [p, src] of Object.entries(RAW_TEMPLATES)) TPL_BY_NAME[fileToName(p)] = src;

const PALETTE_SRC = Object.values(RAW_PALETTE)[0] ?? "";

// Map slug -> handcrafted component name by walking the loader source.
// registry.ts uses `() => import("./fx/Name")` so we extract the last path segment.
const HANDCRAFTED_FILE_BY_SLUG: Record<string, string> = {};
for (const slug of Object.keys(handcraftedFx)) {
  const loader = handcraftedFx[slug].toString();
  const m = loader.match(/["']\.\/fx\/([A-Za-z0-9_]+)["']/);
  if (m) HANDCRAFTED_FILE_BY_SLUG[slug] = m[1];
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
    return {
      slug,
      kind: "handcrafted",
      componentName: handcrafted,
      files: [
        {
          path: `animfx/${handcrafted}.tsx`,
          content: FX_BY_NAME[handcrafted],
          type: "registry:component",
        },
      ],
    };
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