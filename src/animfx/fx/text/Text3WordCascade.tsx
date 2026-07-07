import { useEffect, useState } from "react";
const WORDS = "We build kinetic typography that moves your ideas forward".split(" ");
export default function Text3WordCascade() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((v) => (v < WORDS.length ? v + 1 : 0)), 220);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f] px-8">
      <div className="max-w-3xl text-center font-mono text-3xl md:text-5xl font-bold uppercase tracking-tight">
        {WORDS.map((w, i) => (
          <span
            key={i}
            className="inline-block transition-all duration-500"
            style={{
              opacity: i < n ? 1 : 0.15,
              transform: `translateY(${i < n ? 0 : 12}px)`,
              color: i === n - 1 ? "hsl(var(--neon))" : undefined,
              marginRight: "0.35em",
            }}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}