import { useEffect, useRef } from "react";
import { IG } from "./_ig-tokens";

export function StLocomotiveParallax() {
  const scroll = useRef<HTMLDivElement>(null);
  const l1 = useRef<HTMLDivElement>(null);
  const l2 = useRef<HTMLDivElement>(null);
  const l3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sc = scroll.current; if (!sc) return;
    let raf = 0, target = 0, current = 0;
    const onScroll = () => { target = sc.scrollTop; };
    const tick = () => {
      current += (target - current) * 0.08;
      if (l1.current) l1.current.style.transform = `translate3d(0, ${current * -0.2}px, 0)`;
      if (l2.current) l2.current.style.transform = `translate3d(0, ${current * -0.5}px, 0)`;
      if (l3.current) l3.current.style.transform = `translate3d(0, ${current * -0.85}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    sc.addEventListener("scroll", onScroll);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); sc.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div ref={scroll} className="relative h-[420px] overflow-y-auto rounded-md" style={{ background: IG.bg }}>
      <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-widest" style={{ color: IG.inkFaint }}>
        Locomotive · smooth parallax · scroll ↓
      </div>
      <div className="relative" style={{ height: 1400 }}>
        <div ref={l3} className="absolute inset-x-0 top-24 text-center font-serif" style={{ fontSize: 160, color: IG.rule, letterSpacing: -6 }}>
          SCROLL
        </div>
        <div ref={l2} className="absolute inset-x-0 top-64 text-center font-serif" style={{ fontSize: 96, color: IG.accent, letterSpacing: -3 }}>
          slower
        </div>
        <div ref={l1} className="absolute inset-x-0 top-[520px] mx-auto max-w-md px-6 text-center" style={{ color: IG.ink }}>
          <p className="text-sm leading-relaxed">Cada camada se move numa velocidade diferente. Lerp aplicado ao scrollTop cria a sensação líquida que a Locomotive popularizou.</p>
        </div>
        <div className="absolute inset-x-0 bottom-16 text-center font-mono text-[10px] tabular-nums" style={{ color: IG.inkFaint }}>
          end · lerp 0.08
        </div>
      </div>
    </div>
  );
}