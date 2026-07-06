import { useEffect, useRef } from "react";

export function CursorTrail() {
  const areaRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const target = { x: 0, y: 0 };
    const trails = dotsRef.current.map((_, i) => ({ x: 0, y: 0, ease: 0.12 + i * 0.04 }));
    let raf = 0;

    const loop = () => {
      trails.forEach((t, i) => {
        t.x += (target.x - t.x) * t.ease;
        t.y += (target.y - t.y) * t.ease;
        const el = dotsRef.current[i];
        if (el) el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
    };
    area.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={areaRef}
      className="relative min-h-[300px] overflow-hidden bg-[radial-gradient(circle_at_50%_50%,oklch(0.2_0.008_285),transparent_70%)]"
    >
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center text-xs text-muted-foreground font-mono">
        move your cursor
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) dotsRef.current[i] = el;
          }}
          aria-hidden="true"
          className="pointer-events-none absolute -left-3 -top-3 size-6 rounded-full"
          style={{
            background: i === 0 ? "var(--neon)" : "transparent",
            border: i === 0 ? "none" : "1px solid var(--neon)",
            mixBlendMode: i === 0 ? "normal" : "screen",
            opacity: 1 - i * 0.3,
          }}
        />
      ))}
    </div>
  );
}