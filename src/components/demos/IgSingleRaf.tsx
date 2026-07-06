import { useEffect, useState } from "react";
type Sub = { name: string; work: number; color: string; icon: string };
const SUBS_INIT: Sub[] = [
  { name: "lenis · smooth scroll", work: 0, color: "#22d3ee", icon: "≋" },
  { name: "cursor · 3-lerp", work: 0, color: "#a855f7", icon: "◉" },
  { name: "webgl · shader pass", work: 0, color: "#f472b6", icon: "◈" },
  { name: "scroll · triggers", work: 0, color: "#facc15", icon: "▽" },
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
    <div className="h-[320px] w-full space-y-3 rounded-md border border-border bg-[#050510] p-6 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">◆ raf · shared clock</div>
          <div className="mt-1 font-serif text-lg italic text-white">one loop to rule them all</div>
        </div>
        <div className="text-right">
          <div
            className="font-mono text-4xl tabular-nums"
            style={{ color: fps >= 55 ? "#4ade80" : fps >= 40 ? "#facc15" : "#f87171" }}
          >
            {fps}
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/40">fps · avg 500ms</div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {subs.map((s) => (
          <div key={s.name} className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
              <span className="flex items-center gap-2">
                <span style={{ color: s.color }}>{s.icon}</span>
                {s.name}
              </span>
              <span className="tabular-nums text-white/40">{s.work.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full transition-[width] duration-100"
                style={{ width: `${s.work}%`, background: s.color, boxShadow: `0 0 8px ${s.color}80` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}