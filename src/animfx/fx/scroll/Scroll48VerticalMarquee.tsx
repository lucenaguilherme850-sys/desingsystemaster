import { useEffect, useRef } from "react";

export default function Scroll48VerticalMarquee() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current!;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        el.querySelectorAll<HTMLDivElement>("[data-col]").forEach((c) => {
          const dir = Number(c.dataset.col);
          c.style.transform = `translate3d(0, ${(y * dir * 0.35) % 800}px, 0)`;
        });
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  const words = ["MOTION", "PIXEL", "GRID", "TYPE", "NOISE", "WAVE", "FLUX", "EDGE"];
  return (
    <div ref={wrap} className="relative h-[240vh] overflow-hidden bg-[#050914]">
      <div className="sticky top-0 flex h-screen gap-6 overflow-hidden px-6">
        {[1, -1, 1, -1, 1].map((dir, ci) => (
          <div key={ci} data-col={dir} className="flex flex-1 flex-col gap-6 will-change-transform">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex h-40 items-center justify-center rounded-2xl border text-3xl font-black uppercase"
                   style={{ borderColor: "#00e5ff33", color: (i + ci) % 3 ? "#fff" : "#00e5ff", background: (i + ci) % 4 === 0 ? "#00e5ff11" : "transparent" }}>
                {words[(i + ci) % words.length]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}