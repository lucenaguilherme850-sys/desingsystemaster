const STEPS = [
  { t: 0, ms: "0", label: "HTML + __NUXT__ payload shipped", tag: "TTFB", color: "#22d3ee" },
  { t: 50, ms: "50", label: "Fonts preloaded via <link rel=preload>", tag: "FONTS", color: "#22d3ee" },
  { t: 120, ms: "120", label: "Hero image · Largest Contentful Paint", tag: "LCP", color: "#a855f7" },
  { t: 400, ms: "400", label: "JS hydrates · reuses payload — no refetch", tag: "TTI", color: "#f472b6" },
  { t: 600, ms: "600", label: "WebGL context + Lenis boot", tag: "GL", color: "#facc15" },
];
export function IgSsrPayloadPreload() {
  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-md border border-border bg-[#050510] p-6 font-mono">
      <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/50">
        <span>◆ ssr payload · preload chain</span>
        <span className="text-emerald-400">score 98 / 100</span>
      </div>
      <div className="relative">
        <div className="absolute left-16 top-0 h-full w-px bg-white/10" />
        {STEPS.map((s, i) => (
          <div key={i} className="relative mb-3 flex items-center gap-4">
            <span className="w-14 text-right text-[10px] uppercase text-white/40">{s.ms}ms</span>
            <span
              className="relative z-10 h-3 w-3 rounded-full ring-4 ring-[#050510]"
              style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }}
            />
            <span
              className="rounded px-2 py-0.5 text-[9px] uppercase tracking-widest"
              style={{ background: `${s.color}22`, color: s.color }}
            >
              {s.tag}
            </span>
            <span className="flex-1 text-xs text-white/80">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded border border-white/10 bg-white/[0.02] p-3 text-[10px] leading-relaxed text-white/60">
        <span className="text-cyan-300">payload</span> = JSON do estado SSR embutido no HTML →{" "}
        hidratação sem waterfall de fetches. Zero flash, zero refetch.
      </div>
    </div>
  );
}