import { useEffect, useRef } from "react";

export default function Hero21NoiseTitle() {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cRef.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const loop = () => {
      const img = ctx.createImageData(c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 40;
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 30;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#0a0a18] px-6">
      <canvas ref={cRef} className="absolute inset-0 h-full w-full" />
      <div className="relative text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-white/60">grain · film · vhs</div>
        <h1 className="mt-4 text-6xl md:text-[11rem] font-black uppercase leading-[0.9] text-white">Static.</h1>
      </div>
    </section>
  );
}