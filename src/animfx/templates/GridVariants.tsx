import { useEffect, useRef, useState } from "react";
import { palette } from "./palette";

export default function GridVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 3;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <Stagger c1={c1} c2={c2} bg={bg} />;
  if (kind === 1) return <MasonryHover c1={c1} c2={c2} bg={bg} />;
  return <InfiniteDrift c1={c1} c2={c2} bg={bg} />;
}

function Stagger({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [key, setKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((e) => e.forEach((x) => { if (x.isIntersecting) setKey((k) => k + 1); }), { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="min-h-[80vh] px-8 py-24" style={{ background: bg }}>
      <div key={key} className="mx-auto grid max-w-6xl grid-cols-3 gap-3 md:grid-cols-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md opacity-0" style={{ background: i % 2 ? c1 : c2, animation: `gr .7s cubic-bezier(.2,.7,.2,1) forwards`, animationDelay: `${(i % 6) * 60 + Math.floor(i / 6) * 90}ms` }} />
        ))}
      </div>
      <style>{`@keyframes gr{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function MasonryHover({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [h, setH] = useState<number | null>(null);
  const heights = [200, 260, 180, 300, 220, 240, 190, 280, 210];
  return (
    <div className="p-8" style={{ background: bg }}>
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-3">
        {heights.map((hh, i) => (
          <div key={i} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}
               className="rounded-lg transition-all duration-500"
               style={{ height: hh, background: `linear-gradient(135deg, ${i % 2 ? c1 : c2}, ${bg})`, transform: h === i ? "scale(1.03)" : "scale(1)", filter: h !== null && h !== i ? "grayscale(1) brightness(.5)" : "none" }} />
        ))}
      </div>
    </div>
  );
}

function InfiniteDrift({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div className="grid grid-cols-4 gap-4" style={{ animation: `df 30s linear infinite` }}>
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="h-24 w-24 rounded-lg" style={{ background: i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : `${c1}66`) }} />
        ))}
      </div>
      <style>{`@keyframes df{from{transform:translateY(0) rotate(0)}to{transform:translateY(-40%) rotate(4deg)}}`}</style>
    </div>
  );
}