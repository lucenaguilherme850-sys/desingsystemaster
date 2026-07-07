import { useEffect, useRef } from "react";

export default function Scroll53DiagonalMarquee() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        wrap.current!.querySelectorAll<HTMLDivElement>("[data-r]").forEach((r, i) => {
          const dir = i % 2 ? -1 : 1;
          r.style.transform = `rotate(-12deg) translateX(${(y * dir * 0.4) % 600 - 300}px)`;
        });
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={wrap} className="relative min-h-[220vh] overflow-hidden bg-[#12081a] py-40">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} data-r className="flex gap-8 whitespace-nowrap will-change-transform">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-5xl md:text-7xl font-black uppercase tracking-tight"
                    style={{ color: (r + i) % 2 ? "#ff9ecb" : "#c964ff" }}>
                diagonal · flow ·
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}