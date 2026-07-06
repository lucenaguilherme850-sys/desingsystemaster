import { useState } from "react";

const PRESETS = [
  { name: "hero", w: 6, off: 3, align: "center" as const },
  { name: "wide", w: 10, off: 1, align: "left" as const },
  { name: "aside", w: 4, off: 8, align: "left" as const },
];

export function IgBemUtils() {
  const [i, setI] = useState(0);
  const p = PRESETS[i];
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border bg-[#faf7f2] p-4">
      {/* grid overlay */}
      <div className="pointer-events-none absolute inset-4 grid grid-cols-12 gap-2 opacity-40">
        {Array.from({ length: 12 }).map((_, n) => (
          <div key={n} className="border-l border-r border-dashed border-black/10" />
        ))}
      </div>

      <div className="relative grid h-full grid-cols-12 gap-2">
        {/* rendered block using width__N / offset__N */}
        <div
          key={i}
          className="flex flex-col justify-center rounded border border-black/10 bg-white/70 px-6 py-5 shadow-sm backdrop-blur transition-all duration-500"
          style={{
            gridColumn: `${p.off + 1} / span ${p.w}`,
            textAlign: p.align,
            animation: "ig-bem-in 0.55s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40">
            .hero .hero--{p.name} · width__{p.w} · offset__{p.off}
          </div>
          <h4 className="mt-2 font-serif text-4xl italic leading-tight text-black">
            Immersive Garden
          </h4>
          <p className="mt-2 text-sm text-black/60">
            A declarative layout: BEM names the block, utilities place it on the 12-col grid.
          </p>
        </div>
      </div>

      {/* column ruler */}
      <div className="pointer-events-none absolute inset-x-4 bottom-2 flex justify-between font-mono text-[8px] uppercase text-black/30">
        {Array.from({ length: 12 }).map((_, n) => (
          <span key={n}>{n + 1}</span>
        ))}
      </div>

      {/* preset selector */}
      <div className="absolute right-4 top-4 flex gap-1">
        {PRESETS.map((x, n) => (
          <button
            key={x.name}
            onClick={() => setI(n)}
            className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition-all ${
              n === i
                ? "border-black bg-black text-white"
                : "border-black/20 text-black/50 hover:border-black/50"
            }`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <style>{`@keyframes ig-bem-in{from{opacity:0;transform:translate3d(0,12px,0)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}