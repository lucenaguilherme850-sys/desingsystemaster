import { useEffect, useRef } from "react";

export default function Hero21NoiseTitle() {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    
    let raf = 0;
    let observer: IntersectionObserver | null = null;
    let isVisible = false;

    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
    };

    const loop = () => {
      if (!isVisible) return;
      const img = ctx.createImageData(c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 40;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 30;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);

    observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible) {
          loop();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(c);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (observer) observer.disconnect();
    };
  }, []);
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#0a0a18] px-6">
      <canvas ref={cRef} className="absolute inset-0 h-full w-full" />
      <div className="relative text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-white/60">
          grain · film · vhs
        </div>
        <h1 className="mt-4 text-6xl md:text-[11rem] font-black uppercase leading-[0.9] text-white">
          Static.
        </h1>
      </div>
    </section>
  );
}
