import type { ComponentType } from "react";
import { MagneticButton } from "./MagneticButton";
import { HeroReveal } from "./HeroReveal";
import { InfiniteMarquee } from "./InfiniteMarquee";
import { CursorTrail } from "./CursorTrail";
import { TextSplitReveal } from "./TextSplitReveal";
import { PinnedGallery } from "./PinnedGallery";
import { IgCursor3Lerp } from "./IgCursor3Lerp";
import { IgGridSlots } from "./IgGridSlots";
import { IgHeroLineReveal } from "./IgHeroLineReveal";
import { IgLenisScroll } from "./IgLenisScroll";
import { IgShaderWaveVelocity } from "./IgShaderWaveVelocity";
import { IgIntroLoader } from "./IgIntroLoader";
import { IgImageplaneSync } from "./IgImageplaneSync";

export const DEMO_REGISTRY: Record<string, ComponentType> = {
  MagneticButton,
  HeroReveal,
  InfiniteMarquee,
  CursorTrail,
  TextSplitReveal,
  PinnedGallery,
  IgCursor3Lerp,
  IgGridSlots,
  IgHeroLineReveal,
  IgLenisScroll,
  IgShaderWaveVelocity,
  IgIntroLoader,
  IgImageplaneSync,
};

export function DemoRenderer({ name }: { name: string | null | undefined }) {
  if (!name) return <PlaceholderDemo label="no demo" />;
  const Comp = DEMO_REGISTRY[name];
  if (!Comp) return <PlaceholderDemo label={`demo "${name}" not registered`} />;
  return <Comp />;
}

function PlaceholderDemo({ label }: { label: string }) {
  return (
    <div className="grid min-h-[300px] place-items-center font-mono text-xs text-muted-foreground grid-bg">
      {label}
    </div>
  );
}