import { useEffect, useRef } from "react";

export default function Scroll58ImageMarquee() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        wrap.current!.querySelectorAll<HTMLDivElement>("[data-r]").forEach((r, i) => {
          const dir = i % 2 ? -1 : 1;
          r.style.transform = `translate3d(${(y * dir * 0.6) % 800 - 400}px, 0, 0)`;
        });
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  const colors = ["#00e5ff", "#ff00c8", "#a4ff00", "#ffcc00", "#7a5cff", "#ff5b00"];
  return (
    <div ref={wrap} className="min-h-[220vh] overflow-hidden bg-[#050914] py-32">
      <div className="flex flex-col gap-6">
        {Array.from({ length: 4 }).map((_, r) => (
          <div key={r} data-r className="flex gap-6 will-change-transform">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-48 w-72 shrink-0 rounded-2xl"
                   style={{ background: `linear-gradient(135deg, ${colors[(r * 3 + i) % colors.length]}, #0a0a18)` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}