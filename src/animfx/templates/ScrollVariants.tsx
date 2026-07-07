import { useEffect, useRef } from "react";
import { palette } from "./palette";

// 6 sub-variants selected by seed % 6
export default function ScrollVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 6;
  const [c1, c2, bg] = palette(seed);
  switch (kind) {
    case 0: return <Parallax c1={c1} c2={c2} bg={bg} seed={seed} />;
    case 1: return <PinHorizontal c1={c1} c2={c2} bg={bg} seed={seed} />;
    case 2: return <RevealMask c1={c1} c2={c2} bg={bg} />;
    case 3: return <ImageScale c1={c1} c2={c2} bg={bg} />;
    case 4: return <StickyStack c1={c1} c2={c2} bg={bg} seed={seed} />;
    default: return <TextClip c1={c1} c2={c2} bg={bg} />;
  }
}

function useScrollProgress(ref: React.RefObject<HTMLElement | null>, cb: (p: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        cb(Math.min(1, Math.max(0, -r.top / (total || 1))));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, [ref, cb]);
}

function Parallax({ c1, c2, bg, seed }: { c1: string; c2: string; bg: string; seed: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    const el = ref.current!;
    el.querySelectorAll<HTMLElement>("[data-d]").forEach((n) => {
      const d = Number(n.dataset.d);
      n.style.transform = `translate3d(0, ${p * d * 260}px, 0) scale(${1 + p * d * 0.06})`;
    });
  });
  const rot = (seed % 2 ? 1 : -1);
  return (
    <div ref={ref} className="relative h-[220vh] overflow-hidden" style={{ background: bg }}>
      <div className="sticky top-0 grid h-screen place-items-center">
        <div className="relative text-center">
          <div data-d="-1.5" className="absolute -inset-40 rounded-full blur-3xl opacity-40" style={{ background: c1 }} />
          <div data-d="0.4" className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: c1 }}>parallax {seed}</div>
          <h2 data-d="0.2" className="mt-3 text-6xl md:text-8xl font-black uppercase text-white">Layered</h2>
          <div data-d={String(rot * 2)} className="absolute -right-40 top-6 h-40 w-40 rounded-full border-2" style={{ borderColor: c2 }} />
          <div data-d={String(-rot * 1.6)} className="absolute -left-40 -top-16 h-24 w-24 rotate-45 border-2" style={{ borderColor: c2 }} />
        </div>
      </div>
    </div>
  );
}

function PinHorizontal({ c1, c2, bg, seed }: { c1: string; c2: string; bg: string; seed: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useScrollProgress(wrapRef, (p) => {
    const t = trackRef.current!;
    const move = t.scrollWidth - window.innerWidth;
    t.style.transform = `translate3d(${-p * move}px,0,0)`;
  });
  const cards = Array.from({ length: 5 + (seed % 3) });
  return (
    <div ref={wrapRef} className="relative h-[400vh]" style={{ background: bg }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div ref={trackRef} className="flex gap-8 pl-[10vw] will-change-transform">
          {cards.map((_, i) => (
            <div key={i} className="flex h-[70vh] w-[70vw] max-w-[720px] shrink-0 flex-col justify-end rounded-3xl border p-10"
                 style={{ borderColor: `${c2}55`, background: `linear-gradient(135deg, ${c1}22, transparent)` }}>
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: c1 }}>panel {String(i + 1).padStart(2, "0")}</div>
              <div className="mt-4 text-5xl md:text-7xl font-black uppercase text-white">Slide {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevealMask({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    ref.current!.style.setProperty("--p", String(p));
  });
  return (
    <div ref={ref} className="relative h-[300vh]" style={{ background: bg }}>
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden">
        <h2 className="text-[16vw] font-black uppercase leading-none" style={{
          background: `linear-gradient(90deg, ${c1}, ${c2})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          clipPath: `inset(0 calc((1 - var(--p, 0)) * 100%) 0 0)`,
        }}>Reveal</h2>
      </div>
    </div>
  );
}

function ImageScale({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    const img = ref.current!.querySelector<HTMLDivElement>("[data-img]")!;
    img.style.transform = `scale(${1 + p * 1.4})`;
  });
  return (
    <div ref={ref} className="relative h-[250vh]" style={{ background: bg }}>
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden">
        <div data-img className="h-[60vh] w-[60vw] rounded-2xl" style={{ background: `radial-gradient(circle at 30% 30%, ${c1}, ${c2}, ${bg})` }} />
      </div>
    </div>
  );
}

function StickyStack({ c1, c2, bg, seed }: { c1: string; c2: string; bg: string; seed: number }) {
  const items = Array.from({ length: 4 });
  return (
    <div style={{ background: bg }}>
      {items.map((_, i) => (
        <div key={i} className="sticky top-0 grid h-screen place-items-center" style={{ top: `${i * 40}px` }}>
          <div className="grid h-[70vh] w-[80vw] max-w-4xl place-items-center rounded-3xl p-8"
               style={{ background: `linear-gradient(${45 + i * 60}deg, ${c1}, ${c2})`, transform: `translateY(${(seed + i) % 2 ? 0 : 0}px)` }}>
            <div className="text-6xl font-black uppercase text-black mix-blend-overlay">Card {i + 1}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TextClip({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => { ref.current!.style.setProperty("--p", String(p)); });
  return (
    <div ref={ref} className="relative h-[250vh]" style={{ background: bg }}>
      <div className="sticky top-0 grid h-screen place-items-center px-6">
        <p className="text-3xl md:text-5xl font-bold leading-tight text-white/20"
           style={{
             backgroundImage: `linear-gradient(90deg, ${c1}, ${c2})`,
             WebkitBackgroundClip: "text", backgroundClip: "text",
             WebkitTextFillColor: "transparent",
             clipPath: `inset(0 calc((1 - var(--p, 0)) * 100%) 0 0)`,
             position: "absolute",
           }}>
          A biblioteca de componentes animados que acelera seu design system.
        </p>
        <p className="max-w-4xl text-3xl md:text-5xl font-bold leading-tight text-white/10">
          A biblioteca de componentes animados que acelera seu design system.
        </p>
      </div>
    </div>
  );
}