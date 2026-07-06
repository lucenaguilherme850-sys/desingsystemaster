import { useState } from "react";
export function IgLogoAnim() {
  const [k, setK] = useState(0);
  return (
    <div className="relative grid h-[280px] w-full place-items-center overflow-hidden rounded-md border border-border bg-[radial-gradient(circle_at_50%_50%,#1e1b4b,#050510_70%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,transparent_98%,rgba(255,255,255,0.04)_98%),linear-gradient(90deg,transparent_98%,rgba(255,255,255,0.04)_98%)] bg-[length:24px_24px]" />
      <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        brand · signature
      </div>
      <svg key={k} viewBox="0 0 260 100" className="relative z-10 w-72">
        <defs>
          <linearGradient id="ig-brand" x1="0" x2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="50" r="6" fill="url(#ig-brand)" style={{ opacity: 0, animation: "ig-dot 0.5s 0s cubic-bezier(0.22,1,0.36,1) forwards" }} />
        {"IG".split("").map((ch, i) => (
          <text
            key={i}
            x={i === 0 ? 40 : 130}
            y={72}
            fill="#fff"
            style={{
              fontFamily: "'Times New Roman',serif",
              fontStyle: "italic",
              fontSize: 72,
              opacity: 0,
              animation: `ig-logo 0.7s ${0.15 + i * 0.15}s cubic-bezier(0.22,1,0.36,1) forwards`,
            }}
          >
            {ch}
          </text>
        ))}
        <line
          x1="40" y1="82" x2="220" y2="82"
          stroke="url(#ig-brand)" strokeWidth="2"
          style={{ transformOrigin: "40px 82px", transform: "scaleX(0)", animation: "ig-logo-line 0.9s 0.5s cubic-bezier(0.76,0,0.24,1) forwards" }}
        />
        <text x="40" y="96" fill="rgba(255,255,255,0.5)" style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.3em", opacity: 0, animation: "ig-logo 0.6s 1.1s ease forwards" }}>
          IMMERSIVE · GARDEN
        </text>
      </svg>
      <button
        onClick={() => setK((v) => v + 1)}
        className="absolute bottom-3 right-3 rounded border border-white/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10"
      >
        replay ↻
      </button>
      <style>{`
        @keyframes ig-logo{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes ig-logo-line{to{transform:scaleX(1)}}
        @keyframes ig-dot{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  );
}