import { lazy, type ComponentType } from "react";

export const animFxRegistry: Record<string, () => Promise<{ default: ComponentType }>> = {
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

export function hasLiveFx(slug: string): boolean {
  return slug in animFxRegistry;
}

export function loadLiveFx(slug: string): ComponentType | null {
  const loader = animFxRegistry[slug];
  if (!loader) return null;
  return lazy(loader);
}

export const liveFxSlugs = new Set(Object.keys(animFxRegistry));