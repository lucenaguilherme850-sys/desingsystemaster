import { IG } from "./_ig-tokens";

const STEPS = [
  { ms: "0", label: "HTML + SSR payload shipped", tag: "TTFB" },
  { ms: "50", label: "Fonts preloaded via <link rel=preload>", tag: "FONTS" },
  { ms: "120", label: "Hero image · Largest Contentful Paint", tag: "LCP" },
  { ms: "400", label: "JS hydrates · reuses payload — no refetch", tag: "TTI" },
  { ms: "600", label: "WebGL context + Lenis boot", tag: "GL" },
];
export function IgSsrPayloadPreload() {
  return (
    <div
      className="relative h-[340px] w-full overflow-hidden rounded-md border p-6"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        <span>SSR payload — preload chain</span>
        <span style={{ color: IG.accent }}>98 / 100</span>
      </div>
      <div className="relative">
        <div className="absolute left-[76px] top-1 h-[calc(100%-8px)] w-px" style={{ background: IG.rule }} />
        {STEPS.map((s, i) => (
          <div key={i} className="relative mb-4 flex items-center gap-4">
            <span
              className="w-16 text-right font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: IG.inkFaint }}
            >
              {s.ms}ms
            </span>
            <span
              className="relative z-10 h-2 w-2 rounded-full"
              style={{ background: IG.accent, boxShadow: `0 0 0 3px ${IG.bg}` }}
            />
            <span
              className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em]"
              style={{ borderColor: IG.rule, color: IG.inkMuted }}
            >
              {s.tag}
            </span>
            <span className="flex-1 text-sm" style={{ color: IG.ink }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div
        className="mt-6 border-t pt-4 font-serif text-sm italic leading-relaxed"
        style={{ borderColor: IG.rule, color: IG.inkMuted }}
      >
        The payload lives inside the HTML — hydration reuses it. No waterfall, no flash.
      </div>
    </div>
  );
}