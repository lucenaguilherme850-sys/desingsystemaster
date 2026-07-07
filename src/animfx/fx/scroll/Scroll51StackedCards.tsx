import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll51StackedCards() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    const cards = ref.current!.querySelectorAll<HTMLDivElement>("[data-c]");
    cards.forEach((c, i) => {
      const local = Math.min(1, Math.max(0, p * cards.length - i));
      const next = Math.min(1, Math.max(0, p * cards.length - (i + 1)));
      c.style.transform = `translateY(${(1 - local) * 100}vh) scale(${1 - next * 0.08})`;
    });
  });
  const items = [
    { t: "Discover", c: "#ff3860" }, { t: "Design", c: "#7a00ff" },
    { t: "Develop", c: "#00e5ff" }, { t: "Deliver", c: "#a4ff00" },
  ];
  return (
    <div ref={ref} className="relative h-[400vh] bg-[#0a0a18]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {items.map((it, i) => (
          <div key={i} data-c className="absolute inset-0 grid place-items-center"
               style={{ zIndex: i + 1 }}>
            <div className="grid h-[70vh] w-[80vw] max-w-4xl place-items-center rounded-3xl p-10"
                 style={{ background: `linear-gradient(160deg, ${it.c}, #0a0a18)` }}>
              <div className="text-center">
                <div className="font-mono text-xs uppercase tracking-widest text-white/70">step {i + 1}</div>
                <div className="mt-3 text-7xl md:text-9xl font-black uppercase text-white">{it.t}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}