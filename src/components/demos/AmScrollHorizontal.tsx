import { useEffect, useRef, useState } from "react";
import { AM } from "./_am-tokens";

// Scroll Animation — inner scroll drives a horizontal reel of tiles.
export function AmScrollHorizontal() {
  const wrap = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onScroll = () => {
      const s = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      setP(s);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  const tiles = ["MOTION", "CINEMA", "LOOP", "REEL", "TAKE 04", "SIGNAL", "GRAIN"];
  return (
    <div className="relative overflow-hidden rounded-md" style={{ background: AM.bg, height: 520 }}>
      <div ref={wrap} className="absolute inset-0 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div style={{ height: "300%" }} />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
        <div className="flex gap-6 pl-[10vw]" style={{ transform: `translateX(-${p * 60}%)`, transition: "transform 40ms linear" }}>
          {tiles.map((t, i) => (
            <div
              key={i}
              className="grid h-64 w-72 shrink-0 place-items-center rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${AM.bgSoft}, ${AM.cyanSoft})`,
                border: `1px solid ${AM.rule}`,
                color: AM.ink,
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                boxShadow: i % 2 ? AM.cyanGlow : "none",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: AM.inkFaint }}>
        Scroll inside · horizontal reel · {(p * 100).toFixed(0)}%
      </div>
    </div>
  );
}