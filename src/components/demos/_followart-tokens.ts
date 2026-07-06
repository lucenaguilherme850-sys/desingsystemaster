// FOLLOW.ART aesthetic tokens — extracted from https://follow.art
// Signature: massive condensed display type on saturated orange, blue accent,
// hand-brushed strokes, tilted card stacks in perspective.
export const FA = {
  orange: "#F4793A",
  black: "#0A0A0A",
  white: "#FFFFFF",
  blue: "#0000FF",
  sage: "#8E9487",
  pink: "#C5939D",
  steel: "#8498AC",
  ink60: "rgba(255,255,255,0.6)",
  ink30: "rgba(255,255,255,0.3)",
  // "Hardbop"-like: heavy, ultra-condensed display. Fallback stack that renders
  // strong on every OS without a webfont dependency.
  display: '"Hardbop", "Anton", "Arial Narrow", "Helvetica Neue", Impact, sans-serif',
  body: '"HeadingNow", "Helvetica Neue", Helvetica, Arial, sans-serif',
  ease: "cubic-bezier(0.76, 0, 0.24, 1)",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;