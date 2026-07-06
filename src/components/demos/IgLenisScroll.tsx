import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

export function IgLenisScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;
    const content = wrapper.querySelector<HTMLDivElement>("[data-lenis-content]");
    if (!content) return;

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ({ progress, velocity }: { progress: number; velocity: number }) => {
      setProgress(progress);
      setVelocity(velocity);
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-md border border-border bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
        <span>lenis · smooth scroll</span>
        <span>
          p {progress.toFixed(2)} · v {velocity.toFixed(2)}
        </span>
      </div>
      <div ref={containerRef} className="h-full w-full overflow-auto">
        <div data-lenis-content className="px-6 pb-10 pt-14">
          {Array.from({ length: 12 }).map((_, i) => (
            <section
              key={i}
              className="mb-6 flex h-56 items-end justify-between rounded border border-border bg-card/40 p-4"
              style={{
                transform: `translate3d(0, ${velocity * (i % 2 === 0 ? -4 : 4)}px, 0)`,
                transition: "transform 0.15s linear",
              }}
            >
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                block · {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-4xl text-foreground/80">
                {String(i + 1).padStart(2, "0")}
              </span>
            </section>
          ))}
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary"
        style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
      />
    </div>
  );
}