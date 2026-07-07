import { lazy, type ComponentType, createElement } from "react";
import { seedFromSlug } from "./templates/palette";

// Hand-crafted, prioritized effects
export const handcraftedFx: Record<string, () => Promise<{ default: ComponentType }>> = {
  "scroll-30-650": () => import("./fx/ScrollParallax"),
  "scroll-36-650": () => import("./fx/HorizontalPin"),
  // Wave 1 — Scroll (21 novos)
  "scroll-2-650": () => import("./fx/scroll/Scroll2VerticalPin"),
  "scroll-5-650": () => import("./fx/scroll/Scroll5CircleZoom"),
  "scroll-18-650": () => import("./fx/scroll/Scroll18SkewMarquee"),
  "scroll-23-650": () => import("./fx/scroll/Scroll23StickyGallery"),
  "scroll-32-650": () => import("./fx/scroll/Scroll32ImageStack"),
  "scroll-42-650": () => import("./fx/scroll/Scroll42TextClipReveal"),
  "scroll-45-650": () => import("./fx/scroll/Scroll45SplitImagePin"),
  "scroll-46-650": () => import("./fx/scroll/Scroll46ColorShift"),
  "scroll-48-650": () => import("./fx/scroll/Scroll48VerticalMarquee"),
  "scroll-49-650": () => import("./fx/scroll/Scroll49HorizontalCards"),
  "scroll-50-650": () => import("./fx/scroll/Scroll50GridFadeIn"),
  "scroll-51-650": () => import("./fx/scroll/Scroll51StackedCards"),
  "scroll-52-650": () => import("./fx/scroll/Scroll52ProgressRing"),
  "scroll-53-650": () => import("./fx/scroll/Scroll53DiagonalMarquee"),
  "scroll-54-650": () => import("./fx/scroll/Scroll54StickyLayers"),
  "scroll-58-650": () => import("./fx/scroll/Scroll58ImageMarquee"),
  "scroll-59-650": () => import("./fx/scroll/Scroll59WordCascade"),
  "scroll-60-650": () => import("./fx/scroll/Scroll60ScaleReveal"),
  "scroll-61-650": () => import("./fx/scroll/Scroll61SplitLines"),
  "scroll-62-650": () => import("./fx/scroll/Scroll62NumberCounter"),
  "scroll-63-650": () => import("./fx/scroll/Scroll63LineDrawScroll"),
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

// True apenas para efeitos handcrafted (não gerados por template).
export function isSlugHandcrafted(slug: string): boolean {
  return slug in handcraftedFx;
}