import { useEffect, useState } from "react";

const WORDS = ["creative", "immersive", "kinetic", "digital", "generative"];

export function IgBaselineWordswap() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[300px] w-full place-items-center rounded-md border border-border bg-background">
      <div className="flex items-baseline gap-3 text-4xl md:text-5xl">
        <span className="font-mono text-muted-foreground">we build</span>
        <span className="relative inline-block h-[1.1em] overflow-hidden align-baseline">
          <span
            className="block transition-transform duration-500"
            style={{
              transform: `translate3d(0, ${-i * 100}%, 0)`,
              transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
            }}
          >
            {WORDS.map((w) => (
              <span key={w} className="block font-mono text-primary">
                {w}
              </span>
            ))}
          </span>
        </span>
        <span className="font-mono text-muted-foreground">work.</span>
      </div>
    </div>
  );
}