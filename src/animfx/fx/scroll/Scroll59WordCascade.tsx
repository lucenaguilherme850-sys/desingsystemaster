import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll59WordCascade() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    ref.current!.querySelectorAll<HTMLSpanElement>("[data-w]").forEach((w, i, arr) => {
      const local = Math.min(1, Math.max(0, p * arr.length * 1.2 - i));
      w.style.opacity = String(0.15 + local * 0.85);
      w.style.transform = `translateY(${(1 - local) * 30}px)`;
    });
  });
  const text = "Every scroll reveals a new layer of motion, timing and intent that makes the interface feel deliberate rather than decorative.";
  return (
    <div ref={ref} className="relative h-[280vh] bg-[#050914]">
      <div className="sticky top-0 grid h-screen place-items-center px-6">
        <p className="max-w-4xl text-3xl md:text-5xl font-bold leading-tight text-white">
          {text.split(" ").map((w, i) => (
            <span key={i} data-w className="mr-2 inline-block will-change-transform">{w}</span>
          ))}
        </p>
      </div>
    </div>
  );
}