import { useEffect, useRef } from "react";

export default function ScrollParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let observer: IntersectionObserver | null = null;
    let isVisible = false;

    const layers = el.querySelectorAll<HTMLElement>("[data-depth]");
    const onScroll = () => {
      if (!isVisible) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const progress = -rect.top / (el.offsetHeight - window.innerHeight || 1);
        layers.forEach((l) => {
          const d = Number(l.dataset.depth ?? 0);
          l.style.transform = `translate3d(0, ${progress * d * 220}px, 0)`;
        });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) onScroll();
    }, { threshold: 0.01 });
    observer.observe(el);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (observer) observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className="relative h-[220vh] w-full overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#101828] to-[#0a0e1a]">
      <div className="sticky top-0 grid h-screen place-items-center">
        <div className="relative">
          <div data-depth="-2" className="absolute -inset-32 rounded-full bg-neon/10 blur-3xl" />
          <div data-depth="1" className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.4em] text-neon">smooth scroll</div>
            <h2 data-depth="0.4" className="mt-4 text-6xl md:text-8xl font-black uppercase tracking-tight">Parallax</h2>
            <p data-depth="-0.6" className="mt-4 text-muted-foreground">role a página para ver as camadas se moverem</p>
          </div>
          <div data-depth="2" className="absolute -right-40 top-10 h-40 w-40 rounded-full border border-neon/40" />
          <div data-depth="-1.5" className="absolute -left-48 -top-16 h-24 w-24 rotate-45 border border-neon/60" />
        </div>
      </div>
    </div>
  );
}