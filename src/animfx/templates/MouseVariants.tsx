import { useEffect, useRef } from "react";
import { palette } from "./palette";

export default function MouseVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 4;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <MagneticCursor c1={c1} bg={bg} />;
  if (kind === 1) return <BlendSpotlight c1={c1} c2={c2} bg={bg} />;
  if (kind === 2) return <TrailingDots c1={c1} c2={c2} bg={bg} />;
  return <RippleClick c1={c1} c2={c2} bg={bg} />;
}

function MagneticCursor({ c1, bg }: { c1: string; bg: string }) {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const s = { x: 0, y: 0, rx: 0, ry: 0 };
    let raf = 0;
    const loop = () => {
      s.rx += (s.x - s.rx) * 0.18; s.ry += (s.y - s.ry) * 0.18;
      dot.current!.style.transform = `translate3d(${s.x - 4}px,${s.y - 4}px,0)`;
      ring.current!.style.transform = `translate3d(${s.rx - 24}px,${s.ry - 24}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    const on = (e: MouseEvent) => { const r = root.current!.getBoundingClientRect(); s.x = e.clientX - r.left; s.y = e.clientY - r.top; };
    root.current!.addEventListener("mousemove", on);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); root.current?.removeEventListener("mousemove", on); };
  }, []);
  return (
    <div ref={root} className="relative min-h-[70vh] cursor-none overflow-hidden" style={{ background: bg }}>
      <div ref={ring} className="pointer-events-none absolute left-0 top-0 h-12 w-12 rounded-full border-2 mix-blend-difference" style={{ borderColor: c1 }} />
      <div ref={dot} className="pointer-events-none absolute left-0 top-0 h-2 w-2 rounded-full" style={{ background: c1 }} />
      <div className="grid h-full min-h-[70vh] place-items-center">
        <h2 className="text-6xl md:text-8xl font-black uppercase text-white">move mouse</h2>
      </div>
    </div>
  );
}

function BlendSpotlight({ c1, bg }: { c1: string; c2: string; bg: string }) {
  const root = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const r = root.current!.getBoundingClientRect();
      spot.current!.style.background = `radial-gradient(400px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, ${c1}55, transparent 70%)`;
    };
    root.current!.addEventListener("mousemove", on);
    return () => root.current?.removeEventListener("mousemove", on);
  }, [c1]);
  return (
    <div ref={root} className="relative grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div ref={spot} className="pointer-events-none absolute inset-0" />
      <h2 className="text-6xl md:text-8xl font-black uppercase text-white">spotlight</h2>
    </div>
  );
}

function TrailingDots({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const N = 14; const dots: HTMLDivElement[] = []; const pts = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
    for (let i = 0; i < N; i++) {
      const d = document.createElement("div");
      d.style.cssText = `position:absolute;left:0;top:0;width:${16 - i}px;height:${16 - i}px;border-radius:50%;background:${i % 2 ? c1 : c2};pointer-events:none;opacity:${1 - i / N}`;
      root.current!.appendChild(d); dots.push(d);
    }
    let raf = 0; const tgt = { x: 0, y: 0 };
    const on = (e: MouseEvent) => { const r = root.current!.getBoundingClientRect(); tgt.x = e.clientX - r.left; tgt.y = e.clientY - r.top; };
    root.current!.addEventListener("mousemove", on);
    const loop = () => {
      pts[0].x += (tgt.x - pts[0].x) * 0.3; pts[0].y += (tgt.y - pts[0].y) * 0.3;
      for (let i = 1; i < N; i++) { pts[i].x += (pts[i - 1].x - pts[i].x) * 0.4; pts[i].y += (pts[i - 1].y - pts[i].y) * 0.4; }
      dots.forEach((d, i) => d.style.transform = `translate(${pts[i].x - 8}px,${pts[i].y - 8}px)`);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); root.current?.removeEventListener("mousemove", on); dots.forEach(d => d.remove()); };
  }, [c1, c2]);
  return (
    <div ref={root} className="relative grid min-h-[70vh] cursor-none place-items-center overflow-hidden" style={{ background: bg }}>
      <h2 className="text-6xl md:text-8xl font-black uppercase text-white">trailing</h2>
    </div>
  );
}

function RippleClick({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const root = useRef<HTMLDivElement>(null);
  const onClick = (e: React.MouseEvent) => {
    const r = root.current!.getBoundingClientRect();
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:8px;height:8px;border-radius:50%;background:${Math.random() < 0.5 ? c1 : c2};pointer-events:none;transform:translate(-50%,-50%);animation:rp .8s ease-out forwards`;
    root.current!.appendChild(d);
    setTimeout(() => d.remove(), 800);
  };
  return (
    <div ref={root} onClick={onClick} className="relative grid min-h-[70vh] cursor-pointer place-items-center overflow-hidden" style={{ background: bg }}>
      <h2 className="text-6xl md:text-8xl font-black uppercase text-white">click me</h2>
      <style>{`@keyframes rp{to{width:400px;height:400px;opacity:0}}`}</style>
    </div>
  );
}