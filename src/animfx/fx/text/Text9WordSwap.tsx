import { useEffect, useState } from "react";
const WORDS = ["fast", "smooth", "kinetic", "sharp"];
export default function Text9WordSwap() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="font-mono text-4xl md:text-6xl font-black uppercase tracking-tight flex items-baseline gap-4">
        <span>Ship</span>
        <span className="relative inline-block h-[1.1em] overflow-hidden text-neon min-w-[4ch]">
          {WORDS.map((w, k) => (
            <span
              key={k}
              className="absolute left-0 transition-transform duration-500"
              style={{ transform: `translateY(${(k - i) * 100}%)` }}
            >
              {w}
            </span>
          ))}
        </span>
        <span>work.</span>
      </div>
    </div>
  );
}