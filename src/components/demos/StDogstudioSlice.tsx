import { useState } from "react";
import { IG } from "./_ig-tokens";

const SLIDES = [
  { tag: "case 01", title: "SUPER · STRUCTURE", tone: "#FF5B1F" },
  { tag: "case 02", title: "NEON · MERIDIAN", tone: "#F5F0E8" },
  { tag: "case 03", title: "COSMIC · GARDEN", tone: "#7C5CFF" },
];

export function StDogstudioSlice() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const go = (d: 1 | -1) => { setDir(d); setI((v) => (v + d + SLIDES.length) % SLIDES.length); };
  const s = SLIDES[i];

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md" style={{ background: IG.bg }}>
      {SLIDES.map((sl, idx) => (
        <div
          key={idx}
          className="absolute inset-0 grid place-items-center"
          style={{
            background: `linear-gradient(135deg, ${sl.tone}22, ${IG.bg} 70%)`,
            clipPath: idx === i
              ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
              : dir === 1 ? "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" : "polygon(0 0, 0 0, 0 100%, 0 100%)",
            transition: "clip-path 900ms cubic-bezier(0.76,0,0.24,1)",
          }}
        >
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: sl.tone }}>{sl.tag}</div>
            <div className="mt-3 font-serif text-4xl md:text-6xl" style={{ color: IG.ink, letterSpacing: -1 }}>{sl.title}</div>
          </div>
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: IG.inkFaint }}>
          Dogstudio · slice transition
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(-1)} className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ borderColor: IG.rule, color: IG.ink }}>prev</button>
          <span className="grid place-items-center px-2 font-mono text-[10px]" style={{ color: IG.inkFaint }}>
            {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
          <button onClick={() => go(1)} className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ borderColor: IG.rule, color: IG.ink }}>next</button>
        </div>
      </div>
      <div className="pointer-events-none absolute right-6 top-6 font-mono text-[10px] tabular-nums" style={{ color: s.tone }}>
        {s.tag}
      </div>
    </div>
  );
}