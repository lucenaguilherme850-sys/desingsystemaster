import { useState } from "react";
import { IG } from "./_ig-tokens";

export function StMakeMePulseOrb() {
  const [n, setN] = useState(0);
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md grid place-items-center" style={{ background: IG.bg }}>
      <button
        onClick={() => setN(n + 1)}
        className="group relative size-48 rounded-full outline-none"
        style={{ background: `radial-gradient(circle at 40% 35%, #FFB199, ${IG.accent} 55%, #4A0F00 100%)` }}
        aria-label="pulse"
      >
        <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
        <span
          key={n}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${IG.accent}`,
            animation: "mmp-ring 1200ms cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        />
        <span
          key={`b-${n}`}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: IG.accent, animation: "mmp-flash 500ms ease-out forwards", opacity: 0 }}
        />
        <span className="pointer-events-none absolute inset-0 rounded-full animate-[mmp-breathe_3.2s_ease-in-out_infinite]" style={{ border: `1px solid ${IG.accent}66` }} />
        <span className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: IG.ink }}>
          pulse
        </span>
      </button>
      <div className="absolute inset-x-0 bottom-6 text-center font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: IG.inkFaint }}>
        Make Me Pulse · tap the orb · {n} beats
      </div>
      <style>{`
        @keyframes mmp-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.4);opacity:0} }
        @keyframes mmp-flash { 0%{opacity:0.45} 100%{opacity:0} }
        @keyframes mmp-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>
    </div>
  );
}