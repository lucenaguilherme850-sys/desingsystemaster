import { useEffect, useState } from "react";
import { IG } from "./_ig-tokens";
type Sub = { name: string; work: number };
const SUBS_INIT: Sub[] = [
  { name: "Lenis — smooth scroll", work: 0 },
  { name: "Cursor — 3-lerp", work: 0 },
  { name: "WebGL — shader pass", work: 0 },
  { name: "Scroll — triggers", work: 0 },
];
export function IgSingleRaf() {
  const [fps, setFps] = useState(60);
  const [subs, setSubs] = useState<Sub[]>(SUBS_INIT);
  useEffect(() => {
    let id = 0;
    let last = performance.now();
    let acc = 0;
    let frames = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;
      frames++;
      if (acc >= 500) {
        setFps(Math.round((frames * 1000) / acc));
        acc = 0;
        frames = 0;
      }
      setSubs((s) => s.map((sub, i) => ({ ...sub, work: (Math.sin(now / 400 + i * 1.4) + 1) * 50 })));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className="h-[320px] w-full space-y-4 rounded-md border p-6"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: IG.inkFaint }}
          >
            RAF — shared clock
          </div>
          <div className="mt-1 font-serif text-xl italic" style={{ color: IG.ink }}>
            one loop to rule them all
          </div>
        </div>
        <div className="text-right">
          <div
            className="font-mono text-5xl tabular-nums"
            style={{ color: fps >= 55 ? IG.ink : IG.accent }}
          >
            {fps}
          </div>
          <div
            className="font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{ color: IG.inkFaint }}
          >
            fps · 500 ms avg
          </div>
        </div>
      </div>
      <div className="space-y-2.5 pt-2">
        {subs.map((s) => (
          <div key={s.name} className="space-y-1">
            <div
              className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em]"
              style={{ color: IG.inkMuted }}
            >
              <span>{s.name}</span>
              <span className="tabular-nums" style={{ color: IG.inkFaint }}>
                {s.work.toFixed(0)}%
              </span>
            </div>
            <div className="h-px w-full" style={{ background: IG.rule }}>
              <div
                className="h-full"
                style={{ width: `${s.work}%`, background: IG.accent, transition: "width 100ms linear" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}