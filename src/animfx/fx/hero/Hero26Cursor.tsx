import { useEffect, useRef } from "react";

export default function Hero26Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rpos = { ...pos };
    const on = (e: MouseEvent) => { pos.x = e.clientX; pos.y = e.clientY; };
    window.addEventListener("mousemove", on);
    let raf = 0;
    const loop = () => {
      rpos.x += (pos.x - rpos.x) * 0.12;
      rpos.y += (pos.y - rpos.y) * 0.12;
      if (dot.current) dot.current.style.transform = `translate(${pos.x - 4}px, ${pos.y - 4}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rpos.x - 24}px, ${rpos.y - 24}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener("mousemove", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="relative grid min-h-[80vh] cursor-none place-items-center overflow-hidden bg-[#050914] px-6">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#00e5ff]">move your cursor</div>
        <h1 className="mt-4 text-6xl md:text-9xl font-black uppercase text-white">Follow.</h1>
      </div>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-50 h-12 w-12 rounded-full border-2 border-[#00e5ff]" />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-50 h-2 w-2 rounded-full bg-[#00e5ff]" />
    </section>
  );
}