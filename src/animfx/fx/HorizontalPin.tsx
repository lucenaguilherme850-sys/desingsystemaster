import { useEffect, useRef } from "react";

export default function HorizontalPin() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    let raf = 0;
    let observer: IntersectionObserver | null = null;
    let isVisible = false;

    const onScroll = () => {
      if (!isVisible) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const distance = wrap.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, -rect.top / distance));
        const move = track.scrollWidth - window.innerWidth;
        track.style.transform = `translate3d(${-p * move}px,0,0)`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) onScroll();
    }, { threshold: 0.01 });
    observer.observe(wrap);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (observer) observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  const cards = ["scroll", "hover", "webgl", "grid", "hero", "menu"];
  return (
    <div ref={wrapRef} className="relative h-[400vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div ref={trackRef} className="flex gap-8 pl-[10vw] will-change-transform">
          {cards.map((c, i) => (
            <div key={c} className="flex h-[70vh] w-[70vw] max-w-[720px] shrink-0 flex-col justify-end rounded-3xl border border-border bg-gradient-to-br from-card to-background p-10">
              <div className="font-mono text-xs uppercase tracking-widest text-neon">panel {String(i + 1).padStart(2, "0")}</div>
              <div className="mt-4 text-5xl md:text-7xl font-black uppercase">{c}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}