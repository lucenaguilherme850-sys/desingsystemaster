import { useEffect, useState } from "react";

const WORDS = [
  { w: "immersive", c: "#22d3ee" },
  { w: "kinetic", c: "#a855f7" },
  { w: "sensory", c: "#f472b6" },
  { w: "generative", c: "#facc15" },
  { w: "unforgettable", c: "#4ade80" },
];

export function IgBaselineWordswap() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative grid h-[300px] w-full place-items-center overflow-hidden rounded-md border border-border bg-[radial-gradient(circle_at_30%_20%,#1e1b4b,#050510_70%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,transparent_95%,rgba(255,255,255,0.05)_95%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.05)_95%)] bg-[length:32px_32px]" />
      <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        01 — manifesto
      </div>
      <div className="relative z-10 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 px-6 text-center font-serif text-4xl italic text-white md:text-5xl">
        <span>we design</span>
        <span className="relative inline-block h-[1.1em] overflow-hidden align-baseline">
          <span
            className="block transition-transform duration-500"
            style={{ transform: `translate3d(0, ${-i * 100}%, 0)`, transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }}
          >
            {WORDS.map((it) => (
              <span key={it.w} className="block font-sans not-italic font-semibold" style={{ color: it.c }}>
                {it.w}
              </span>
            ))}
          </span>
        </span>
        <span>experiences.</span>
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        {String(i + 1).padStart(2, "0")}/{WORDS.length}
      </div>
    </div>
  );
}