import { useEffect, useState } from "react";
export default function Text8OutlineFill() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="relative">
        <h1
          className="font-mono text-7xl md:text-9xl font-black uppercase tracking-tight"
          style={{ WebkitTextStroke: "2px hsl(var(--neon))", color: "transparent" }}
        >
          Outline
        </h1>
        <h1
          className="absolute inset-0 font-mono text-7xl md:text-9xl font-black uppercase tracking-tight overflow-hidden transition-all duration-1000"
          style={{ color: "hsl(var(--neon))", clipPath: on ? "inset(0 0 0 0)" : "inset(100% 0 0 0)" }}
        >
          Outline
        </h1>
      </div>
    </div>
  );
}