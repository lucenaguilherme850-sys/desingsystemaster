import { useEffect, useRef, useState } from "react";
import { IG } from "./_ig-tokens";

const ROWS = [
  "OFF · BRAND · IDENTITY · MOTION · ",
  "STRATEGY · SYSTEM · STORY · RITUAL · ",
  "BOLD · LOUD · QUIET · PRECISE · ",
];

export function StOffbrandSkewMarquee() {
  const [dir, setDir] = useState(1);
  const [speed, setSpeed] = useState(1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current; if (!el) return;
    let last = 0, raf = 0;
    const onScroll = () => {
      const y = el.scrollTop;
      const d = y - last; last = y;
      setDir(d >= 0 ? 1 : -1);
      setSpeed(Math.min(3, 1 + Math.abs(d) / 8));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSpeed(1));
    };
    el.addEventListener("scroll", onScroll);
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={box} className="relative h-[420px] overflow-y-auto rounded-md" style={{ background: IG.bg }}>
      <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-widest" style={{ color: IG.inkFaint }}>
        OFF+BRAND · scroll to skew
      </div>
      <div style={{ height: 900 }} className="flex flex-col justify-center gap-6 py-40">
        {ROWS.map((r, i) => (
          <div key={i} className="overflow-hidden">
            <div
              className="whitespace-nowrap font-serif transition-transform duration-200 will-change-transform"
              style={{
                fontSize: 72,
                color: i === 1 ? IG.accent : IG.ink,
                letterSpacing: -2,
                transform: `skewY(${dir * (speed - 1) * 4}deg)`,
                animation: `off-marquee ${18 / speed}s linear infinite ${dir === -1 ? "reverse" : ""}`,
              }}
            >
              {r.repeat(4)}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes off-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}