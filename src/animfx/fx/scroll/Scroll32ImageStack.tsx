import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll32ImageStack() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    const cards = ref.current!.querySelectorAll<HTMLDivElement>("[data-card]");
    cards.forEach((c, i) => {
      const local = Math.min(1, Math.max(0, p * cards.length - i));
      c.style.transform = `translate3d(${(1 - local) * 40}vw, 0, 0) rotate(${(1 - local) * (i % 2 ? 6 : -6)}deg)`;
      c.style.opacity = String(0.4 + local * 0.6);
    });
  });
  const items = ["#ff00c8", "#00e5ff", "#a4ff00", "#ffcc00", "#7a5cff"];
  return (
    <div ref={ref} className="relative h-[400vh] bg-[#0a0518]">
      <div className="sticky top-0 grid h-screen place-items-center">
        <div className="relative h-[70vh] w-[70vw] max-w-3xl">
          {items.map((c, i) => (
            <div key={i} data-card className="absolute inset-0 rounded-3xl border p-8 will-change-transform"
                 style={{ background: `linear-gradient(135deg, ${c}, transparent)`, borderColor: `${c}55`, zIndex: i }}>
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: c }}>frame {String(i + 1).padStart(2, "0")}</div>
              <div className="mt-4 text-6xl font-black uppercase text-white">Stack {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}