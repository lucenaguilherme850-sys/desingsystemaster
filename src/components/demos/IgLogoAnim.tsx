import { useState } from "react";
import { IG } from "./_ig-tokens";

export function IgLogoAnim() {
  const [k, setK] = useState(0);
  return (
    <div
      className="relative grid h-[280px] w-full place-items-center overflow-hidden rounded-md border"
      style={{ background: IG.bg, borderColor: IG.rule }}
    >
      <div
        className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        Brand — signature
      </div>
      <svg key={k} viewBox="0 0 260 110" className="relative z-10 w-80">
        <circle
          cx="20" cy="55" r="5" fill={IG.accent}
          style={{ opacity: 0, animation: `ig-dot 500ms 0s ${IG.easeOut} forwards` }}
        />
        {"IG".split("").map((ch, i) => (
          <text
            key={i}
            x={i === 0 ? 40 : 130}
            y={72}
            fill={IG.ink}
            style={{
              fontFamily: "'Times New Roman',serif",
              fontStyle: "italic",
              fontSize: 72,
              opacity: 0,
              animation: `ig-logo 800ms ${0.15 + i * 0.18}s ${IG.ease} forwards`,
            }}
          >
            {ch}
          </text>
        ))}
        <line
          x1="40" y1="86" x2="220" y2="86"
          stroke={IG.accent} strokeWidth="1.5"
          style={{
            transformOrigin: "40px 86px",
            transform: "scaleX(0)",
            animation: `ig-logo-line 1100ms 0.55s ${IG.ease} forwards`,
          }}
        />
        <text
          x="40" y="100" fill={IG.inkFaint}
          style={{
            fontFamily: "monospace", fontSize: 8, letterSpacing: "0.35em",
            opacity: 0, animation: `ig-logo 600ms 1.3s ${IG.easeOut} forwards`,
          }}
        >
          IMMERSIVE · GARDEN
        </text>
      </svg>
      <button
        onClick={() => setK((v) => v + 1)}
        className="absolute bottom-4 right-4 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ borderColor: IG.rule, color: IG.inkMuted }}
      >
        replay
      </button>
      <style>{`
        @keyframes ig-logo{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes ig-logo-line{to{transform:scaleX(1)}}
        @keyframes ig-dot{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  );
}