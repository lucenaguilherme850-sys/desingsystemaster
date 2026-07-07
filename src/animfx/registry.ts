import { lazy, type ComponentType, createElement } from "react";
import { seedFromSlug } from "./templates/palette";

// Hand-crafted, prioritized effects
export const handcraftedFx: Record<string, () => Promise<{ default: ComponentType }>> = {
  "scroll-30-650": () => import("./fx/ScrollParallax"),
  "scroll-36-650": () => import("./fx/HorizontalPin"),
  "mouse-4-650": () => import("./fx/MagneticCursor"),
  "hover-6-650": () => import("./fx/HoverImageReveal"),
  "hover-11-650": () => import("./fx/HoverImageReveal"),
  "text-1-650": () => import("./fx/TextScramble"),
  "grid-1-650": () => import("./fx/GridStagger"),
  "grid-6-650": () => import("./fx/GridStagger"),
  "3d-7-650": () => import("./fx/CardTilt3D"),
  "sliders-7-650": () => import("./fx/DragSlider"),
  "sliders-13-650": () => import("./fx/StackSlider"),
  "hero-8-650": () => import("./fx/HeroSplit"),
  "hero-10-650": () => import("./fx/HeroGradientMesh"),
  "webgl-2-650": () => import("./fx/WebglWaves"),
  "webgl-3-650": () => import("./fx/WebglWaves"),
  "bg-1-650": () => import("./fx/NoiseBackground"),
  "svg-7-650": () => import("./fx/SvgLineDraw"),
  "svg-8-650": () => import("./fx/SvgLineDraw"),
  "menu-8-650": () => import("./fx/OverlayMenu"),
};

// Category-based templates cover ALL slugs
const TEMPLATES: Record<string, () => Promise<{ default: ComponentType<{ seed?: number }> }>> = {
  scroll: () => import("./templates/ScrollVariants"),
  hero: () => import("./templates/HeroVariants"),
  hovers: () => import("./templates/HoverVariants"),
  hover: () => import("./templates/HoverVariants"),
  menu: () => import("./templates/MenuVariants"),
  menus: () => import("./templates/MenuVariants"),
  navs: () => import("./templates/MenuVariants"),
  mouse: () => import("./templates/MouseVariants"),
  mouseeff: () => import("./templates/MouseVariants"),
  pegetr: () => import("./templates/TransitionVariants"),
  pagetr: () => import("./templates/TransitionVariants"),
  physic: () => import("./templates/PhysicsVariants"),
  physics: () => import("./templates/PhysicsVariants"),
  sliders: () => import("./templates/SliderVariants"),
  svg: () => import("./templates/SvgVariants"),
  svgs: () => import("./templates/SvgVariants"),
  text: () => import("./templates/TextVariants"),
  webgl: () => import("./templates/WebglVariants"),
  "3d": () => import("./templates/ThreeDVariants"),
  grid: () => import("./templates/GridVariants"),
  grids: () => import("./templates/GridVariants"),
  bg: () => import("./templates/BgVariants"),
};

export function hasLiveFx(slug: string): boolean {
  if (slug in handcrafted) return true;
  const { category } = seedFromSlug(slug);
  return category in TEMPLATES;
}
const handcrafted = handcraftedFx;

export function loadLiveFx(slug: string): ComponentType | null {
  if (slug in handcraftedFx) return lazy(handcraftedFx[slug]);
  const { category, n } = seedFromSlug(slug);
  const loader = TEMPLATES[category];
  if (!loader) return null;
  const Lazy = lazy(loader);
  const Wrapper: ComponentType = () => createElement(Lazy, { seed: n } as { seed?: number });
  Wrapper.displayName = `FxTemplate(${category}#${n})`;
  return Wrapper;
}

// For UI: all slugs that resolve to something live.
// Kept as a function to avoid needing full slug list at import time.
export function isLiveCategory(category: string): boolean {
  return category in TEMPLATES;
}

// Keep old export name for backward compat (listing badge). Every slug in a
// supported category counts as live now.
export const liveFxSlugs: Set<string> = new Set(Object.keys(handcraftedFx));
// Marker used by listing to check membership dynamically.
export function isSlugLive(slug: string): boolean {
  return hasLiveFx(slug);
}