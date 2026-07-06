import { useEffect, useRef, useState } from "react";
import { FA } from "./_followart-tokens";

// FOLLOW.ART signature: viewport-wide condensed wordmark that subtly tilts
// on mouse, sits on a saturated orange field, breathes on load.
export function StFollowGiantType() {
  const wrap = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    const onMove = (e: MouseEvent) => {
      const r = wrap.current?.getBoundingClientRect();
      if (!r) return;
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x: cy * -4, y: cx * 6 });
    };
    window.addEventListener("mousemove", onMove);
    return () => { clearTimeout(t); window.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <div ref={wrap} className="relative min-h-[520px] overflow-hidden grid place-items-center" style={{ background: FA.orange }}>
      <div className="absolute inset-x-0 top-4 flex items-center justify-between px-6 font-medium" style={{ color: FA.white, fontFamily: FA.body, fontSize: 13 }}>
        <div>
          <div>FOLLOW.ART</div>
          <div style={{ color: FA.ink60 }}>One Practice. One Card.</div>
        </div>
        <nav className="flex gap-6" style={{ color: FA.ink60 }}>
          <span>About</span><span>Product</span><span>Pricing</span><span>FAQ</span>
        </nav>
      </div>
      <h1
        className="select-none whitespace-nowrap"
        style={{
          fontFamily: FA.display,
          color: FA.white,
          fontWeight: 900,
          fontStretch: "condensed",
          fontSize: "clamp(120px, 22vw, 320px)",
          lineHeight: 0.82,
          letterSpacing: "-0.02em",
          transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${ready ? 1 : 0.92})`,
          opacity: ready ? 1 : 0,
          transition: `transform 1200ms ${FA.easeOut}, opacity 900ms ${FA.easeOut}`,
          willChange: "transform",
        }}
      >
        FOLLOW.ART
      </h1>
      <div className="absolute inset-x-0 bottom-6 text-center" style={{ color: FA.white, fontFamily: FA.body, fontSize: 12, letterSpacing: "0.2em" }}>
        ONE CARD · SHARE IT · BE NOTICED
      </div>
    </div>
  );
}