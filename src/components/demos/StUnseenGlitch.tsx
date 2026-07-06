import { useEffect, useState } from "react";
import { IG } from "./_ig-tokens";

const WORDS = ["FEELING", "MATTER", "SIGNAL", "ETHER"];

export function StUnseenGlitch() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % WORDS.length), 1800);
    return () => clearInterval(id);
  }, []);
  const w = WORDS[i];

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md grid place-items-center" style={{ background: IG.bg }}>
      <div className="relative">
        <span
          key={`r-${i}`}
          className="absolute inset-0 font-serif italic"
          style={{
            fontSize: 120, color: "#FF3B3B", letterSpacing: -4, mixBlendMode: "screen",
            animation: "unseen-rgb 900ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >{w}</span>
        <span
          key={`g-${i}`}
          className="absolute inset-0 font-serif italic"
          style={{
            fontSize: 120, color: "#00E5CC", letterSpacing: -4, mixBlendMode: "screen",
            animation: "unseen-rgb 900ms cubic-bezier(0.22,1,0.36,1) 40ms reverse",
          }}
        >{w}</span>
        <span
          key={`w-${i}`}
          className="relative font-serif italic"
          style={{ fontSize: 120, color: IG.ink, letterSpacing: -4 }}
        >{w}</span>
      </div>
      <div className="absolute inset-x-0 bottom-6 text-center font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: IG.inkFaint }}>
        Unseen Studio · rgb split reveal
      </div>
      <style>{`@keyframes unseen-rgb { 0%{transform:translate(-8px,4px);opacity:0} 30%{opacity:1} 100%{transform:translate(0,0);opacity:0.9}}`}</style>
    </div>
  );
}