import { useEffect, useRef, useState } from "react";

const slides = [
  { i: "01", title: "Compose", body: "Slides live inside a sticky viewport." },
  { i: "02", title: "Scroll", body: "Vertical scroll drives horizontal translate." },
  { i: "03", title: "Progress", body: "getBoundingClientRect → clamped 0..1." },
  { i: "04", title: "Release", body: "At progress = 1, the pin releases." },
];

export function PinnedGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = Math.max(0, Math.min(1, -rect.top / total));
        setProgress(p);
        const maxX = track.scrollWidth - track.parentElement!.clientWidth;
        track.style.transform = `translate3d(${-p * maxX}px, 0, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-card/40">
        <div className="absolute inset-x-0 top-4 z-10 mx-auto flex max-w-md items-center gap-3 px-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            scroll to advance
          </span>
          <div className="h-px flex-1 bg-border">
            <div className="h-px bg-neon" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="font-mono text-[10px] tabular-nums text-neon">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div ref={trackRef} className="flex h-full items-center gap-6 px-8 will-change-transform">
          {slides.map((s) => (
            <article
              key={s.i}
              className="grid h-[70vh] w-[70vw] max-w-[520px] shrink-0 place-content-center gap-4 rounded-xl border border-border bg-background p-10"
            >
              <span className="font-mono text-xs text-neon">{s.i}</span>
              <h3 className="text-3xl font-semibold tracking-tight">{s.title}</h3>
              <p className="text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}