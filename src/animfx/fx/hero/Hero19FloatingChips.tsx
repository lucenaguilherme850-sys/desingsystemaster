import { useEffect, useRef } from "react";

export default function Hero19FloatingChips() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      ref.current?.querySelectorAll<HTMLSpanElement>("[data-i]").forEach((el, i) => {
        el.style.transform = `translate(${Math.sin(t + i) * 12}px, ${Math.cos(t * 0.8 + i) * 10}px)`;
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  const tags = ["React", "GSAP", "WebGL", "Three.js", "Framer", "Rive", "Lottie", "Tailwind", "Vite", "Motion"];
  return (
    <section ref={ref} className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#050914] px-6">
      <div className="text-center max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-black uppercase text-white">Stack ready.</h1>
        <p className="mx-auto mt-4 max-w-xl text-white/60">Ship any framework. Motion stays consistent.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {tags.map((t, i) => (
            <span key={t} data-i className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white/80 will-change-transform">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}