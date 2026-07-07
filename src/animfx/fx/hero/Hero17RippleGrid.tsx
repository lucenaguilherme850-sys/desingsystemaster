import { useEffect, useRef } from "react";

export default function Hero17RippleGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const el = ref.current!;
    const on = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    let raf = 0;
    const loop = () => {
      const cells = el.querySelectorAll<HTMLDivElement>("[data-c]");
      cells.forEach((c) => {
        const [cx, cy] = c.dataset.c!.split(",").map(Number);
        const dx = cx - mouse.current.x;
        const dy = cy - mouse.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const s = Math.max(0.2, 1 - d * 1.6);
        c.style.transform = `scale(${0.5 + s * 0.9})`;
        c.style.opacity = String(0.15 + s * 0.85);
      });
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("mousemove", on);
    loop();
    return () => { el.removeEventListener("mousemove", on); cancelAnimationFrame(raf); };
  }, []);
  const cols = 24, rows = 14;
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#04121a]">
      <div ref={ref} className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 6, padding: 12 }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const x = (i % cols) / (cols - 1);
          const y = Math.floor(i / cols) / (rows - 1);
          return <div key={i} data-c={`${x},${y}`} className="rounded-full bg-[#00ffb2]" />;
        })}
      </div>
      <div className="pointer-events-none relative text-center">
        <h1 className="text-6xl md:text-9xl font-black uppercase text-white mix-blend-difference">Ripple</h1>
      </div>
    </section>
  );
}