import { useEffect, useState } from "react";
const WORDS = ["Rotate", "Flip", "Spin", "Turn"];
export default function Text13Rotate3D() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f] [perspective:800px]">
      <div className="relative h-24 md:h-32 w-[6ch] font-mono text-5xl md:text-7xl font-black uppercase">
        {WORDS.map((w, k) => {
          const delta = ((k - i) + WORDS.length) % WORDS.length;
          const active = delta === 0;
          return (
            <span
              key={k}
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 [transform-style:preserve-3d]"
              style={{
                transform: active ? "rotateX(0deg)" : delta === 1 ? "rotateX(-90deg)" : "rotateX(90deg)",
                opacity: active ? 1 : 0,
                color: active ? "hsl(var(--neon))" : "white",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
}