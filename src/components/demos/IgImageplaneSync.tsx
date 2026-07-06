import { useEffect, useRef, useState } from "react";

type Item = { label: string; hue: number };
const ITEMS: Item[] = [
  { label: "atlas", hue: 200 },
  { label: "vertex", hue: 280 },
  { label: "helix", hue: 340 },
  { label: "quanta", hue: 40 },
  { label: "prism", hue: 160 },
  { label: "flux", hue: 100 },
];

export function IgImageplaneSync() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const planesRef = useRef<Array<HTMLDivElement | null>>([]);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    let lastY = scroller.scrollTop;
    let vel = 0;
    let raf = 0;

    const loop = () => {
      const y = scroller.scrollTop;
      const inst = y - lastY;
      lastY = y;
      vel = vel * 0.85 + inst * 0.15;
      setVelocity(vel);

      planesRef.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const parent = scroller.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - (parent.top + parent.height / 2);
        const norm = center / parent.height;
        const skew = Math.max(-14, Math.min(14, vel * 0.6));
        const scale = 1 - Math.min(0.15, Math.abs(vel) * 0.004);
        const img = el.querySelector<HTMLDivElement>("[data-plane]");
        if (img) {
          img.style.transform = `translate3d(0, ${-norm * 40}px, 0) scale(${scale})`;
          img.style.filter = `blur(${Math.min(6, Math.abs(vel) * 0.15)}px)`;
        }
        el.style.transform = `skewY(${skew * 0.15}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative h-[440px] w-full overflow-hidden rounded-md border border-border bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
        <span>imageplane · scroll sync</span>
        <span>v {velocity.toFixed(2)}</span>
      </div>
      <div ref={scrollRef} className="h-full w-full overflow-auto pt-9">
        <div className="grid grid-cols-2 gap-4 px-4 pb-8">
          {ITEMS.concat(ITEMS).map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                planesRef.current[i] = el;
              }}
              className="relative h-56 overflow-hidden rounded border border-border bg-card"
              style={{ transformOrigin: "center", transition: "transform 0.1s linear" }}
            >
              <div
                data-plane
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${item.hue} 70% 20%), hsl(${
                    (item.hue + 60) % 360
                  } 80% 45%))`,
                  transition: "transform 0.15s linear, filter 0.15s linear",
                }}
              />
              <div className="absolute inset-0 flex items-end justify-between p-3 font-mono text-[10px] uppercase tracking-wider text-white/90 mix-blend-difference">
                <span>{item.label}</span>
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}