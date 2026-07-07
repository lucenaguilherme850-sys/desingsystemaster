import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll60ScaleReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => { ref.current!.style.setProperty("--p", String(p)); });
  return (
    <div ref={ref} className="relative h-[280vh] bg-[#04121a]">
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden">
        <div className="relative h-[80vh] w-[80vw] max-w-6xl overflow-hidden rounded-3xl"
             style={{ clipPath: "inset(calc((1 - var(--p, 0)) * 40%) round 24px)" }}>
          <div className="absolute inset-0"
               style={{ background: "conic-gradient(from 200deg at 50% 50%, #00ffb2, #3ea3ff, #7a5cff, #00ffb2)", transform: "scale(calc(1 + var(--p, 0) * 0.3))" }} />
          <div className="absolute inset-0 grid place-items-center">
            <h2 className="text-[10vw] font-black uppercase text-white mix-blend-overlay">Expand</h2>
          </div>
        </div>
      </div>
    </div>
  );
}