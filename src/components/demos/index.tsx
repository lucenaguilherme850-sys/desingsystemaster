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
import { IgProgressBar } from "./IgProgressBar";
import { IgBaselineWordswap } from "./IgBaselineWordswap";
import { IgMediaBlock } from "./IgMediaBlock";
import { IgProjectBlock } from "./IgProjectBlock";
import { IgTextBlock } from "./IgTextBlock";
import { IgWebglGlobal } from "./IgWebglGlobal";
import { IgRouteFade } from "./IgRouteFade";
import { IgNewsletterExpand } from "./IgNewsletterExpand";
import { IgFooterWebgl } from "./IgFooterWebgl";
import { IgLogoAnim } from "./IgLogoAnim";
import { IgFontSystem } from "./IgFontSystem";
import { IgPaletteTritone } from "./IgPaletteTritone";
import { IgBemUtils } from "./IgBemUtils";
import { IgIntersectionReveal } from "./IgIntersectionReveal";
import { IgSingleRaf } from "./IgSingleRaf";
import { IgTweakpaneDebug } from "./IgTweakpaneDebug";
import { IgSsrPayloadPreload } from "./IgSsrPayloadPreload";
import { IgI18nGoogleFriendly } from "./IgI18nGoogleFriendly";
import { StActiveTheoryTiltCards } from "./StActiveTheoryTiltCards";
import { StLusionGoo } from "./StLusionGoo";
import { StDogstudioSlice } from "./StDogstudioSlice";
import { StUnseenGlitch } from "./StUnseenGlitch";
import { StLocomotiveParallax } from "./StLocomotiveParallax";
import { StResnSkewGrid } from "./StResnSkewGrid";
import { StMakeMePulseOrb } from "./StMakeMePulseOrb";
import { StMerciMichelBlobs } from "./StMerciMichelBlobs";
import { StOffbrandSkewMarquee } from "./StOffbrandSkewMarquee";
import { StIgWordCycle } from "./StIgWordCycle";
import { StFollowGiantType } from "./StFollowGiantType";
import { StFollowCardStack } from "./StFollowCardStack";
import { StFollowBrushX } from "./StFollowBrushX";
import { StFollowJoinCta } from "./StFollowJoinCta";
import { AmHeroSlam } from "./AmHeroSlam";
import { AmScrollHorizontal } from "./AmScrollHorizontal";
import { AmMouseSpotlight } from "./AmMouseSpotlight";
import { AmGridReveal } from "./AmGridReveal";
import { AmSliderStack } from "./AmSliderStack";
import { AmNavOverlay } from "./AmNavOverlay";
import { AmHoverWarp } from "./AmHoverWarp";
import { AmShaderWaves } from "./AmShaderWaves";

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
  IgProgressBar,
  IgBaselineWordswap,
  IgMediaBlock,
  IgProjectBlock,
  IgTextBlock,
  IgWebglGlobal,
  IgRouteFade,
  IgNewsletterExpand,
  IgFooterWebgl,
  IgLogoAnim,
  IgFontSystem,
  IgPaletteTritone,
  IgBemUtils,
  IgIntersectionReveal,
  IgSingleRaf,
  IgTweakpaneDebug,
  IgSsrPayloadPreload,
  IgI18nGoogleFriendly,
  StActiveTheoryTiltCards,
  StLusionGoo,
  StDogstudioSlice,
  StUnseenGlitch,
  StLocomotiveParallax,
  StResnSkewGrid,
  StMakeMePulseOrb,
  StMerciMichelBlobs,
  StOffbrandSkewMarquee,
  StIgWordCycle,
  StFollowGiantType,
  StFollowCardStack,
  StFollowBrushX,
  StFollowJoinCta,
  AmHeroSlam,
  AmScrollHorizontal,
  AmMouseSpotlight,
  AmGridReveal,
  AmSliderStack,
  AmNavOverlay,
  AmHoverWarp,
  AmShaderWaves,
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