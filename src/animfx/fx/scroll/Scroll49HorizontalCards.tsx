import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll49HorizontalCards() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    const track = ref.current!.querySelector<HTMLDivElement>("[data-t]")!;
    track.style.transform = `translate3d(${-p * (track.scrollWidth - window.innerWidth)}px,0,0)`;
  });
  const cards = Array.from({ length: 8 });
  return (
    <div ref={ref} className="relative h-[600vh] bg-[#0f0518]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div data-t className="flex gap-6 pl-8 will-change-transform">
          {cards.map((_, i) => (
            <article key={i} className="flex h-[70vh] w-[520px] shrink-0 flex-col justify-between rounded-2xl border border-white/10 p-8"
                     style={{ background: `linear-gradient(160deg, hsl(${i * 40} 90% 55%), hsl(${i * 40 + 40} 90% 40%))` }}>
              <div className="font-mono text-xs uppercase tracking-widest text-black/70">case {String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="text-5xl font-black uppercase text-white">Project {i + 1}</div>
                <div className="mt-3 text-sm text-white/80">Motion + brand system</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}