import { useRef, useState } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll50GridFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useScrollProgress(ref, setP);
  const cells = Array.from({ length: 24 });
  return (
    <div ref={ref} className="relative h-[300vh] bg-[#050914]">
      <div className="sticky top-0 grid h-screen place-items-center p-8">
        <div className="grid w-full max-w-5xl grid-cols-4 gap-4 md:grid-cols-6">
          {cells.map((_, i) => {
            const local = Math.min(1, Math.max(0, p * cells.length * 1.5 - i));
            return (
              <div key={i} className="aspect-square rounded-xl"
                   style={{
                     background: `linear-gradient(${(i * 17) % 360}deg, #00e5ff, #7a5cff)`,
                     opacity: local,
                     transform: `translateY(${(1 - local) * 30}px) scale(${0.85 + local * 0.15})`,
                   }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}