import { useRef } from "react";
import { palette } from "./palette";

export default function ThreeDVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 3;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <TiltCards c1={c1} c2={c2} bg={bg} />;
  if (kind === 1) return <RotatingCube c1={c1} c2={c2} bg={bg} />;
  return <LayeredParallax c1={c1} c2={c2} bg={bg} />;
}

function TiltCard({ c1, c2 }: { c1: string; c2: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current!; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
  };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={() => (ref.current!.style.transform = "perspective(900px)")}
         className="h-72 w-56 rounded-2xl p-6 transition-transform" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, transformStyle: "preserve-3d" }}>
      <div className="font-mono text-xs uppercase text-white/80">3d tilt</div>
      <div className="mt-6 text-4xl font-black text-white">Card</div>
    </div>
  );
}

function TiltCards({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  return <div className="flex min-h-[60vh] flex-wrap items-center justify-center gap-6 p-10" style={{ background: bg }}>{[0, 1, 2].map((i) => <TiltCard key={i} c1={c1} c2={c2} />)}</div>;
}

function RotatingCube({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const faces = [
    { t: "rotateY(0deg) translateZ(80px)", c: c1 },
    { t: "rotateY(90deg) translateZ(80px)", c: c2 },
    { t: "rotateY(180deg) translateZ(80px)", c: c1 },
    { t: "rotateY(-90deg) translateZ(80px)", c: c2 },
    { t: "rotateX(90deg) translateZ(80px)", c: c1 },
    { t: "rotateX(-90deg) translateZ(80px)", c: c2 },
  ];
  return (
    <div className="grid min-h-[60vh] place-items-center" style={{ background: bg, perspective: "800px" }}>
      <div className="relative h-40 w-40" style={{ transformStyle: "preserve-3d", animation: "cube 12s linear infinite" }}>
        {faces.map((f, i) => <div key={i} className="absolute inset-0 grid place-items-center text-2xl font-black text-white" style={{ background: f.c, transform: f.t, opacity: 0.85 }}>{i + 1}</div>)}
      </div>
      <style>{`@keyframes cube{to{transform:rotateX(360deg) rotateY(360deg)}}`}</style>
    </div>
  );
}

function LayeredParallax({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.querySelectorAll<HTMLElement>("[data-l]").forEach((el) => {
      const d = Number(el.dataset.l);
      el.style.transform = `translate3d(${x * d * 40}px, ${y * d * 40}px, 0)`;
    });
  };
  return (
    <div ref={ref} onMouseMove={move} className="relative grid min-h-[60vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div data-l="-2" className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 30%, ${c1}44, transparent 60%)` }} />
      <div data-l="-1" className="absolute h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: c2 }} />
      <div data-l="1" className="relative text-6xl md:text-8xl font-black uppercase text-white">Depth</div>
      <div data-l="2" className="absolute top-1/3 right-10 h-24 w-24 rotate-45 border-2" style={{ borderColor: c1 }} />
    </div>
  );
}