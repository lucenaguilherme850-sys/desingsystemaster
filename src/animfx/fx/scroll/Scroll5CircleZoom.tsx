import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll5CircleZoom() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => { ref.current!.style.setProperty("--p", String(p)); });
  return (
    <div ref={ref} className="relative h-[300vh] bg-[#04121a]">
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(circle at 50% 50%, transparent calc(var(--p, 0) * 90%), #04121a calc(var(--p, 0) * 90% + 1px))" }} />
        <div className="relative text-center" style={{ transform: "scale(calc(1 + var(--p, 0) * 6))", opacity: "calc(1 - var(--p, 0))" }}>
          <div className="mx-auto h-64 w-64 rounded-full" style={{ background: "conic-gradient(from 0deg, #00ffb2, #3ea3ff, #00ffb2)" }} />
          <h2 className="mt-6 text-4xl font-black uppercase text-white">Dive in</h2>
        </div>
      </div>
    </div>
  );
}