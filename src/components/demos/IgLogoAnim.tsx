import { useState } from "react";
export function IgLogoAnim() {
  const [k, setK] = useState(0);
  return (
    <div className="relative grid h-[280px] w-full place-items-center rounded-md border border-border bg-background">
      <svg key={k} viewBox="0 0 200 60" className="w-64">
        {"IG".split("").map((ch, i) => (
          <text
            key={i}
            x={i === 0 ? 20 : 100}
            y={48}
            className="fill-foreground"
            style={{
              fontFamily: "monospace",
              fontSize: 56,
              opacity: 0,
              animation: `ig-logo 0.7s ${i * 0.15}s cubic-bezier(0.22,1,0.36,1) forwards`,
            }}
          >
            {ch}
          </text>
        ))}
        <line
          x1="20" y1="52" x2="180" y2="52"
          className="stroke-primary" strokeWidth="2"
          style={{ transformOrigin: "left", transform: "scaleX(0)", animation: "ig-logo-line 0.8s 0.4s cubic-bezier(0.76,0,0.24,1) forwards" }}
        />
      </svg>
      <button
        onClick={() => setK((v) => v + 1)}
        className="absolute bottom-3 right-3 rounded border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground hover:bg-card"
      >
        replay
      </button>
      <style>{`
        @keyframes ig-logo{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes ig-logo-line{to{transform:scaleX(1)}}
      `}</style>
    </div>
  );
}