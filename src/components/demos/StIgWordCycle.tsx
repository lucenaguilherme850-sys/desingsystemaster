import { useEffect, useState } from "react";
import { IG } from "./_ig-tokens";

const WORDS = ["experiences", "systems", "rituals", "artefacts"];

export function StIgWordCycle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md grid place-items-center px-10" style={{ background: IG.bg }}>
      <h2 className="max-w-3xl font-serif" style={{ color: IG.ink, fontSize: 56, letterSpacing: -2, lineHeight: 1.05 }}>
        We design meaningful{" "}
        <span className="relative inline-block align-bottom overflow-hidden" style={{ height: "1.05em", minWidth: 320 }}>
          {WORDS.map((w, idx) => (
            <span
              key={w}
              className="absolute left-0 top-0 italic"
              style={{
                color: IG.accent,
                transform: idx === i ? "translateY(0)" : idx < i ? "translateY(-100%)" : "translateY(100%)",
                opacity: idx === i ? 1 : 0,
                transition: "transform 700ms cubic-bezier(0.76,0,0.24,1), opacity 700ms",
              }}
            >
              {w}
            </span>
          ))}
        </span>
        <br />for brands that dare.
      </h2>
      <div className="absolute inset-x-0 bottom-6 text-center font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: IG.inkFaint }}>
        Immersive Garden · editorial word cycle
      </div>
    </div>
  );
}