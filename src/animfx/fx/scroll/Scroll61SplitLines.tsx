import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll61SplitLines() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    ref.current!.querySelectorAll<HTMLDivElement>("[data-line]").forEach((l, i) => {
      const local = Math.min(1, Math.max(0, p * 8 - i * 0.6));
      l.style.transform = `translateX(${(1 - local) * (i % 2 ? 60 : -60)}vw)`;
      l.style.opacity = String(local);
    });
  });
  const lines = ["We build", "the tiny", "moments", "that make", "brands feel", "alive."];
  return (
    <div ref={ref} className="relative h-[280vh] bg-[#0f0518]">
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden px-6">
        <div className="w-full max-w-5xl">
          {lines.map((l, i) => (
            <div key={i} data-line className="text-6xl md:text-8xl font-black uppercase leading-[0.9] will-change-transform"
                 style={{ color: i % 2 ? "#ff00c8" : "#fff" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}