import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll45SplitImagePin() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    ref.current!.style.setProperty("--p", String(p));
  });
  return (
    <div ref={ref} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 grid h-screen grid-cols-2 overflow-hidden">
        <div className="relative overflow-hidden" style={{ transform: "translateY(calc(var(--p, 0) * -30vh))" }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 40% 40%, #ff00c8, #0a0518 70%)" }} />
        </div>
        <div className="relative overflow-hidden" style={{ transform: "translateY(calc(var(--p, 0) * 30vh))" }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 60% 60%, #00e5ff, #050914 70%)" }} />
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <h2 className="text-[14vw] font-black uppercase leading-none text-white mix-blend-difference"
              style={{ transform: "scale(calc(1 + var(--p, 0) * 0.4))" }}>
            Duality
          </h2>
        </div>
      </div>
    </div>
  );
}