export const ASSET_CATEGORIES = [
  "Button",
  "Interaction",
  "Navigation",
  "Layout",
  "Animation",
  "Scroll",
  "Background",
  "Section",
  "Hero",
  "Gallery",
  "Typography",
  "Component",
  "UX Pattern",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export type Asset = {
  id: string;
  slug: string;
  name: string;
  category: string;
  demo_component: string | null;
  short_description: string;
  objective: string;
  description: string;
  how_it_works: string;
  flow: string[];
  technologies: string[];
  html_structure: string;
  css_notes: string;
  js_notes: string;
  math: string[];
  events: string[];
  algorithm: string;
  performance: Record<string, unknown>;
  responsiveness: string;
  accessibility: string;
  dependencies: string[];
  complexity: number;
  estimated_time: string;
  issues: string[];
  improvements: string[];
  variations: string[];
  compatibility: string[];
  reuse: string;
  code_base: string;
  checklist: string[];
  visual_impact: number;
  ux_impact: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetInput = Omit<Asset, "id" | "created_at" | "updated_at" | "created_by">;