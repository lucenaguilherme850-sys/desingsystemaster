import { useEffect, useState } from "react";
type Sub = { name: string; work: number };
export function IgSingleRaf() {
  const [fps, setFps] = useState(60);
  const [subs, setSubs] = useState<Sub[]>([
    { name: "lenis", work: 0 },
    { name: "cursor", work: 0 },
    { name: "webgl", work: 0 },
    { name: "scroll-triggers", work: 0 },
  ]);
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
      setSubs((s) => s.map((sub) => ({ ...sub, work: (Math.sin(now / 400 + sub.name.length) + 1) * 50 })));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="h-[320px] w-full space-y-3 rounded-md border border-border bg-background p-6 font-mono">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>single raf · shared clock</span>
        <span className="text-primary">{fps} fps</span>
      </div>
      {subs.map((s) => (
        <div key={s.name} className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground">
            <span>{s.name}</span>
            <span>{s.work.toFixed(0)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded bg-card">
            <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${s.work}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}