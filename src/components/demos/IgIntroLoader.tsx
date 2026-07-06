import { useEffect, useState } from "react";

export function IgIntroLoader() {
  const [key, setKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setProgress(0);
    setDone(false);
    let raf = 0;
    const start = performance.now();
    const duration = 2200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key]);

  const pct = Math.round(progress * 100);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border bg-background">
      <div
        className="absolute inset-0 z-20 flex flex-col justify-between bg-background px-6 py-5 transition-transform duration-700"
        style={{
          transform: done ? "translate3d(0, -100%, 0)" : "translate3d(0, 0, 0)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>ig · loader</span>
          <span>{String(pct).padStart(3, "0")}</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="overflow-hidden font-mono text-6xl leading-none text-foreground tabular-nums">
            <span
              className="inline-block"
              style={{
                transform: `translate3d(0, ${(1 - progress) * 40}%, 0)`,
              }}
            >
              {pct}
            </span>
            <span className="text-muted-foreground">%</span>
          </div>
          <div className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            loading<br />assets
          </div>
        </div>
        <div className="relative h-px w-full bg-border">
          <div
            className="absolute inset-y-0 left-0 bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="absolute inset-0 z-10 grid place-items-center">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            revealed content
          </div>
          <div className="mt-2 font-mono text-3xl text-foreground">immersive · garden</div>
          <button
            type="button"
            onClick={() => setKey((k) => k + 1)}
            className="mt-6 rounded border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground transition-colors hover:bg-card"
          >
            replay
          </button>
        </div>
      </div>
    </div>
  );
}