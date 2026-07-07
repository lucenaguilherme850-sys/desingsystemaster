import { useEffect, useRef } from "react";
import { useScrollVelocity } from "./_useScrollProgress";

export default function Scroll18SkewMarquee() {
  const rowRefs = useRef<HTMLDivElement[]>([]);
  const skew = useRef(0);
  const target = useRef(0);
  useScrollVelocity((v) => { target.current = Math.max(-18, Math.min(18, v * 8)); });
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      skew.current += (target.current - skew.current) * 0.12;
      target.current *= 0.9;
      rowRefs.current.forEach((r, i) => {
        if (!r) return;
        const dir = i % 2 ? -1 : 1;
        r.style.transform = `skewY(${skew.current * dir * 0.5}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  const words = ["design", "motion", "grid", "type", "pixel", "flow"];
  return (
    <div className="min-h-[220vh] bg-[#0f0518] py-32">
      {Array.from({ length: 6 }).map((_, r) => (
        <div key={r} ref={(el) => { if (el) rowRefs.current[r] = el; }}
             className="flex gap-8 overflow-hidden whitespace-nowrap py-3 will-change-transform">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-6xl md:text-8xl font-black uppercase tracking-tight"
                  style={{ color: (r + i) % 2 ? "#ff00c8" : "#fff" }}>
              {words[(r + i) % words.length]} —
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}