import useEmblaCarousel from "embla-carousel-react";

const slides = Array.from({ length: 8 }).map((_, i) => ({
  n: String(i + 1).padStart(2, "0"),
  t: ["Nebula", "Kinetic", "Prism", "Aurora", "Vertex", "Pulse", "Echo", "Nova"][i],
}));

export default function DragSlider() {
  const [emblaRef] = useEmblaCarousel({ dragFree: true, loop: true });
  return (
    <div className="min-h-[70vh] bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-neon">drag slider</div>
        <h2 className="mt-3 text-4xl md:text-6xl font-black uppercase">arraste →</h2>
      </div>
      <div ref={emblaRef} className="mt-10 overflow-hidden">
        <div className="flex gap-6 pl-[10vw]">
          {slides.map((s) => (
            <div key={s.n} className="flex h-96 w-72 shrink-0 flex-col justify-between rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
              <div>
                <div className="text-3xl font-black uppercase">{s.t}</div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-neon">free-scroll · loop</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}