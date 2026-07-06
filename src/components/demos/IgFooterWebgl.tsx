import { useEffect, useRef } from "react";
export function IgFooterWebgl() {
  const c = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = c.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let id = 0;
    const t0 = performance.now();
    const draw = () => {
      const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
      const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(120,180,255,0.4)";
      ctx.lineWidth = 1 * devicePixelRatio;
      for (let y = 0; y < 6; y++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const ny = h * 0.5 + Math.sin(x * 0.01 + t + y) * 20 * devicePixelRatio + (y - 3) * 12 * devicePixelRatio;
          if (x === 0) ctx.moveTo(x, ny);
          else ctx.lineTo(x, ny);
        }
        ctx.stroke();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-md border border-border bg-black">
      <canvas ref={c} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 font-mono text-white">
        <div className="text-4xl">let&apos;s talk.</div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
          <span>hello@ig.studio</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
}