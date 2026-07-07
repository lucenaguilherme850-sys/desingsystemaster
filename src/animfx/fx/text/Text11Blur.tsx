import { useEffect, useState } from "react";
const WORDS = "Focus emerges from the noise".split(" ");
export default function Text11Blur() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((v) => (v < WORDS.length ? v + 1 : 0)), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f] px-8">
      <div className="max-w-3xl text-center font-mono text-4xl md:text-6xl font-black uppercase tracking-tight">
        {WORDS.map((w, i) => (
          <span
            key={i}
            className="inline-block transition-all duration-700"
            style={{
              filter: i < n ? "blur(0)" : "blur(14px)",
              opacity: i < n ? 1 : 0.4,
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