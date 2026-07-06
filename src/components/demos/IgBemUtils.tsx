import { useState } from "react";
import { IG } from "./_ig-tokens";

const PRESETS = [
  { name: "hero", w: 6, off: 3, align: "center" as const },
  { name: "wide", w: 10, off: 1, align: "left" as const },
  { name: "aside", w: 4, off: 8, align: "left" as const },
];

export function IgBemUtils() {
  const [i, setI] = useState(0);
  const p = PRESETS[i];
  return (
    <div
      className="relative h-[360px] w-full overflow-hidden rounded-md border p-6"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      {/* grid overlay */}
      <div
        className="pointer-events-none absolute inset-6 grid grid-cols-12 gap-2 opacity-100"
      >
        {Array.from({ length: 12 }).map((_, n) => (
          <div key={n} className="border-l" style={{ borderColor: IG.rule }} />
        ))}
      </div>

      <div className="relative grid h-full grid-cols-12 gap-2">
        <div
          key={i}
          className="flex flex-col justify-center px-1 py-5"
          style={{
            gridColumn: `${p.off + 1} / span ${p.w}`,
            textAlign: p.align,
            animation: `ig-bem-in 800ms ${IG.ease}`,
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: IG.accent }}
          >
            .hero--{p.name}
          </div>
          <div
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: IG.inkFaint }}
          >
            width__{p.w} · offset__{p.off}
          </div>
          <h4
            className="mt-3 font-serif text-4xl italic leading-tight"
            style={{ color: IG.ink }}
          >
            Immersive Garden
          </h4>
          <p className="mt-2 max-w-[45ch] text-sm" style={{ color: IG.inkMuted }}>
            A declarative layout: BEM names the block, utilities place it on the 12-col grid.
          </p>
        </div>
      </div>

      {/* column ruler */}
      <div
        className="pointer-events-none absolute inset-x-6 bottom-2 flex justify-between font-mono text-[8px] uppercase tracking-widest"
        style={{ color: IG.inkFaint }}
      >
        {Array.from({ length: 12 }).map((_, n) => (
          <span key={n}>{n + 1}</span>
        ))}
      </div>

      {/* preset selector */}
      <div className="absolute right-5 top-5 flex gap-1">
        {PRESETS.map((x, n) => (
          <button
            key={x.name}
            onClick={() => setI(n)}
            className="rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{
              borderColor: n === i ? IG.ink : IG.rule,
              color: n === i ? IG.bg : IG.inkMuted,
              background: n === i ? IG.ink : "transparent",
              transition: `all 400ms ${IG.ease}`,
            }}
          >
            {x.name}
          </button>
        ))}
      </div>

      <style>{`@keyframes ig-bem-in{from{opacity:0;transform:translate3d(0,16px,0)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}