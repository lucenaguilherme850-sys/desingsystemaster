const BLOCKS = [
  { area: "2 / 1 / span 4 / span 5", bg: "radial-gradient(circle at 30% 30%, #38bdf8, #0c4a6e 60%, #020617)", tag: "aurora", ratio: "5:4" },
  { area: "2 / 8 / span 3 / span 4", bg: "conic-gradient(from 180deg at 60% 40%, #f472b6, #a855f7, #22d3ee, #f472b6)", tag: "helix", ratio: "4:3" },
  { area: "5 / 3 / span 2 / span 3", bg: "linear-gradient(135deg,#052e16,#22c55e,#facc15)", tag: "canopy", ratio: "3:2" },
  { area: "5 / 7 / span 2 / span 5", bg: "linear-gradient(135deg,#1c1917,#f97316,#facc15)", tag: "ember", ratio: "5:2" },
];

export function IgMediaBlock() {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border bg-[#050510] p-3">
      <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
        <span>media · block system</span>
        <span>04 items · 12-col</span>
      </div>
      <div className="grid h-full grid-cols-12 grid-rows-6 gap-2 pt-6">
        {BLOCKS.map((b, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded border border-white/10 transition-transform duration-500 hover:scale-[1.02]"
            style={{ gridArea: b.area, background: b.bg }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white/80 backdrop-blur">
              {b.ratio}
            </div>
            <div className="absolute bottom-3 left-3 font-serif text-xl italic text-white">
              {b.tag}
            </div>
            <div className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest text-white/70">
              0{i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}