import { useEffect, useState } from "react";
import { FA } from "./_followart-tokens";

// FOLLOW.ART brush-stroke X: an SVG path is drawn on top of a huge headline
// as if painted, using stroke-dasharray/dashoffset — the site's 404 signature.
export function StFollowBrushX() {
  const [play, setPlay] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPlay(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div className="relative min-h-[520px] overflow-hidden grid place-items-center" style={{ background: FA.orange }}>
      <h2
        className="text-center select-none"
        style={{
          fontFamily: FA.display,
          color: FA.black,
          fontWeight: 900,
          fontStretch: "condensed",
          fontSize: "clamp(90px, 15vw, 220px)",
          lineHeight: 0.85,
          letterSpacing: "-0.02em",
        }}
      >
        PAGE NOT<br />FOUND
      </h2>
      <svg
        className="absolute pointer-events-none"
        viewBox="0 0 400 400"
        style={{ width: "42vmin", height: "42vmin", top: "50%", left: "50%", transform: "translate(-50%,-52%)" }}
      >
        <path
          d="M60 70 C 120 140, 240 260, 340 340"
          stroke={FA.white}
          strokeWidth={38}
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: 600,
            strokeDashoffset: play ? 0 : 600,
            transition: `stroke-dashoffset 900ms ${FA.easeOut}`,
            filter: "url(#brush)",
          }}
        />
        <path
          d="M340 70 C 260 150, 160 250, 60 340"
          stroke={FA.white}
          strokeWidth={34}
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: 600,
            strokeDashoffset: play ? 0 : 600,
            transition: `stroke-dashoffset 900ms ${FA.easeOut} 250ms`,
            filter: "url(#brush)",
          }}
        />
        <defs>
          <filter id="brush">
            <feTurbulence baseFrequency="0.9" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="8" />
          </filter>
        </defs>
      </svg>
      <button
        className="absolute bottom-6 right-6 flex items-center gap-3 px-6 py-4"
        style={{ background: FA.black, color: FA.white, fontFamily: FA.body, fontSize: 15 }}
        onClick={() => { setPlay(false); setTimeout(() => setPlay(true), 60); }}
      >
        <span className="grid size-6 place-items-center rounded-full" style={{ background: FA.white, color: FA.black }}>→</span>
        Replay stroke
      </button>
    </div>
  );
}