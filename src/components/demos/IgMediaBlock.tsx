import { IG } from "./_ig-tokens";

const BLOCKS = [
  { area: "2 / 1 / span 4 / span 5", tone: 0.9, tag: "Aurora", ratio: "5:4" },
  { area: "2 / 8 / span 3 / span 4", tone: 0.5, tag: "Helix", ratio: "4:3" },
  { area: "5 / 3 / span 2 / span 3", tone: 0.7, tag: "Canopy", ratio: "3:2" },
  { area: "5 / 7 / span 2 / span 5", tone: 0.35, tag: "Ember", ratio: "5:2" },
];

export function IgMediaBlock() {
  return (
    <div
      className="relative h-[360px] w-full overflow-hidden rounded-md border p-3"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="absolute inset-x-4 top-4 z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        <span>Media — block system</span>
        <span>04 / 12-col</span>
      </div>
      <div className="grid h-full grid-cols-12 grid-rows-6 gap-2 pt-8">
        {BLOCKS.map((b, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-sm border"
            style={{
              gridArea: b.area,
              borderColor: IG.rule,
              background: `linear-gradient(135deg, rgba(245,240,232,${b.tone * 0.14}), rgba(245,240,232,${b.tone * 0.03}))`,
              transition: `transform 700ms ${IG.ease}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              className="absolute left-3 top-3 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
              style={{ borderColor: IG.rule, color: IG.inkMuted }}
            >
              {b.ratio}
            </div>
            <div className="absolute bottom-3 left-3 font-serif text-2xl italic" style={{ color: IG.ink }}>
              {b.tag}
            </div>
            <div
              className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: IG.accent }}
            >
              № {String(i + 1).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}