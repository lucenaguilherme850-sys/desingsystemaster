import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll54StickyLayers() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    ref.current!.querySelectorAll<HTMLDivElement>("[data-l]").forEach((n) => {
      const d = Number(n.dataset.l);
      n.style.transform = `translate3d(0, ${p * d * -120}px, 0)`;
    });
  });
  return (
    <div ref={ref} className="relative h-[280vh] bg-[#14050a]">
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden">
        <div data-l="0.2" className="absolute inset-0" style={{ background: "radial-gradient(60% 40% at 30% 70%, #ff6a0055, transparent 70%)" }} />
        <div data-l="0.6" className="absolute inset-0" style={{ background: "radial-gradient(50% 40% at 70% 30%, #ffcc0055, transparent 70%)" }} />
        <div data-l="1.2" className="relative text-center">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-[#ffcc00]">layered · scroll</div>
          <h2 className="mt-3 text-6xl md:text-8xl font-black uppercase text-white">Warm dawn</h2>
        </div>
        <div data-l="1.8" className="absolute bottom-10 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-widest text-white/50">
          scroll to shift the strata
        </div>
      </div>
    </div>
  );
}