import { useEffect, useState } from "react";
import { palette } from "./palette";

export default function SvgVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 3;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <LineDraw c1={c1} c2={c2} bg={bg} />;
  if (kind === 1) return <MorphBlob c1={c1} c2={c2} bg={bg} />;
  return <BorderTrace c1={c1} c2={c2} bg={bg} />;
}

function LineDraw({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 100); return () => clearTimeout(t); }, []);
  const paths = ["M20 150 Q100 20 200 100 T380 60", "M20 170 Q120 60 200 140 T380 90", "M20 130 Q90 40 220 120 T380 40"];
  return (
    <div className="grid min-h-[60vh] place-items-center" style={{ background: bg }}>
      <svg viewBox="0 0 400 200" className="w-[80vw] max-w-2xl">
        <defs><linearGradient id={`lg-${c1}`}><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
        {paths.map((d, i) => (
          <path key={i} d={d} stroke={`url(#lg-${c1})`} strokeWidth="3" fill="none" strokeLinecap="round"
                style={{ strokeDasharray: 900, strokeDashoffset: go ? 0 : 900, transition: `stroke-dashoffset 2s cubic-bezier(.6,.05,.3,1) ${i * 300}ms` }} />
        ))}
      </svg>
    </div>
  );
}

function MorphBlob({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const shapes = [
    "M60,-70C75,-58,84,-35,84,-13C84,10,75,32,60,50C45,68,22,82,-3,84C-27,86,-54,76,-68,58C-83,40,-85,14,-79,-9C-73,-32,-59,-52,-42,-64C-24,-77,-3,-82,17,-79C37,-76,45,-82,60,-70Z",
    "M45,-63C56,-52,60,-33,66,-14C71,4,78,22,71,38C64,54,44,68,23,74C2,79,-19,76,-38,67C-56,58,-71,42,-76,24C-81,5,-77,-16,-67,-32C-56,-48,-40,-59,-23,-67C-6,-75,12,-79,25,-77C37,-74,34,-74,45,-63Z",
    "M50,-63C63,-50,71,-31,73,-11C75,10,71,32,58,47C45,62,23,71,1,69C-21,68,-42,56,-56,40C-70,25,-77,7,-75,-11C-73,-30,-63,-49,-48,-60C-33,-72,-16,-76,2,-78C21,-81,37,-77,50,-63Z",
  ];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % shapes.length), 1800); return () => clearInterval(id); }, [shapes.length]);
  return (
    <div className="grid min-h-[60vh] place-items-center" style={{ background: bg }}>
      <svg viewBox="-100 -100 200 200" className="w-72 h-72">
        <path d={shapes[i]} fill={c1} style={{ transition: "d 1.6s cubic-bezier(.6,0,.3,1)", filter: `drop-shadow(0 0 40px ${c2})` }} />
      </svg>
    </div>
  );
}

function BorderTrace({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center gap-8 md:grid-cols-3" style={{ background: bg }}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 200 120" className="w-56">
          <rect x="4" y="4" width="192" height="112" rx="12" fill="none" stroke={i % 2 ? c1 : c2} strokeWidth="2"
                style={{ strokeDasharray: 620, strokeDashoffset: 620, animation: `bt 3s ${i * 0.4}s linear infinite` }} />
          <text x="100" y="70" textAnchor="middle" fill="white" fontFamily="monospace" fontSize="14">CARD {i + 1}</text>
        </svg>
      ))}
      <style>{`@keyframes bt{to{stroke-dashoffset:0}}`}</style>
    </div>
  );
}