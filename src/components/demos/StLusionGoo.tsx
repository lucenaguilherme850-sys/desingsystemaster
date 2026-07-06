import { useEffect, useRef } from "react";
import { IG } from "./_ig-tokens";

// Metaball / gooey cursor trail via SVG filter (feGaussianBlur + feColorMatrix)
export function StLusionGoo() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const dots: HTMLSpanElement[] = [];
    const N = 14;
    for (let i = 0; i < N; i++) {
      const d = document.createElement("span");
      const s = 44 - i * 2.4;
      d.style.cssText = `position:absolute;left:0;top:0;width:${s}px;height:${s}px;border-radius:50%;background:${IG.accent};transform:translate(-999px,-999px);will-change:transform;pointer-events:none;`;
      el.appendChild(d);
      dots.push(d);
    }
    const pts = Array.from({ length: N }, () => ({ x: -999, y: -999 }));
    let mx = -999, my = -999, raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const tick = () => {
      pts[0].x += (mx - pts[0].x) * 0.35;
      pts[0].y += (my - pts[0].y) * 0.35;
      for (let i = 1; i < N; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.4;
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.4;
        dots[i].style.transform = `translate(${pts[i].x - (44 - i * 2.4) / 2}px, ${pts[i].y - (44 - i * 2.4) / 2}px)`;
      }
      dots[0].style.transform = `translate(${pts[0].x - 22}px, ${pts[0].y - 22}px)`;
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointermove", onMove); dots.forEach(d => d.remove()); };
  }, []);

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md" style={{ background: IG.bg }}>
      <svg className="absolute size-0" aria-hidden>
        <defs>
          <filter id="lusion-goo">
            <feGaussianBlur stdDeviation="10" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </defs>
      </svg>
      <div ref={wrap} className="absolute inset-0 cursor-crosshair" style={{ filter: "url(#lusion-goo)" }} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <h2 className="font-serif italic" style={{ color: IG.ink, fontSize: 64, letterSpacing: -1 }}>
          play with matter
        </h2>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: IG.inkFaint }}>
        Lusion · metaball cursor
      </div>
    </div>
  );
}