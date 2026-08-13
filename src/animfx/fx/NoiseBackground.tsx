import { useEffect, useRef } from "react";

export default function NoiseBackground() {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let observer: IntersectionObserver | null = null;

    const resize = () => {
      if (!c) return;
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
    };

    const draw = () => {
      if (!c) return;
      const img = ctx.createImageData(c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 40) | 0;
        d[i] = v; d[i + 1] = v; d[i + 2] = v + 20; d[i + 3] = 40;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (raf) return;
      draw();
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    window.addEventListener("resize", resize);

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) start();
      else stop();
    }, { threshold: 0.01 });
    observer.observe(c);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      if (observer) observer.disconnect();
    };
  }, []);
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#141828] to-[#0a0e1a]">
      <canvas ref={cRef} className="absolute inset-0 h-full w-full mix-blend-overlay" />
      <div className="relative text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-neon">animated noise bg</div>
        <h2 className="mt-3 text-5xl md:text-7xl font-black uppercase">grain</h2>
      </div>
    </div>
  );
}