import { useRef, useState } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll62NumberCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useScrollProgress(ref, setP);
  const stats = [
    { v: 280, s: "componentes", c: "#00e5ff" },
    { v: 14, s: "categorias", c: "#ff00c8" },
    { v: 60, s: "fps garantido", c: "#a4ff00" },
    { v: 100, s: "% código aberto", c: "#ffcc00" },
  ];
  return (
    <div ref={ref} className="relative h-[250vh] bg-[#050914]">
      <div className="sticky top-0 grid h-screen place-items-center px-8">
        <div className="grid w-full max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => {
            const local = Math.min(1, Math.max(0, p * 1.4 - i * 0.1));
            return (
              <div key={i} className="text-center" style={{ opacity: 0.2 + local * 0.8, transform: `translateY(${(1 - local) * 40}px)` }}>
                <div className="text-6xl md:text-8xl font-black tabular-nums" style={{ color: s.c }}>
                  {Math.round(s.v * local)}
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-widest text-white/70">{s.s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}