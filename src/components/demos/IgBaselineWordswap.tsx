import { useEffect, useState } from "react";
import { IG } from "./_ig-tokens";

const WORDS = ["immersive", "kinetic", "sensory", "generative", "unforgettable"];

export function IgBaselineWordswap() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="relative grid h-[300px] w-full place-items-center overflow-hidden rounded-md border"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        01 — manifesto
      </div>
      <div className="relative z-10 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 px-6 text-center font-serif text-4xl italic md:text-5xl">
        <span>we design</span>
        <span
          className="relative inline-block h-[1.1em] overflow-hidden align-baseline"
          style={{ minWidth: "10ch" }}
        >
          <span
            className="block"
            style={{
              transform: `translate3d(0, ${-i * 100}%, 0)`,
              transition: `transform 900ms ${IG.ease}`,
            }}
          >
            {WORDS.map((w) => (
              <span key={w} className="block" style={{ color: IG.accent }}>
                {w}
              </span>
            ))}
          </span>
        </span>
        <span>experiences.</span>
      </div>
      <div
        className="absolute bottom-5 right-5 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        {String(i + 1).padStart(2, "0")} / {String(WORDS.length).padStart(2, "0")}
      </div>
    </div>
  );
}