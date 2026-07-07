import { useRef, useState } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll52ProgressRing() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useScrollProgress(ref, setP);
  const r = 120;
  const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className="relative h-[250vh] bg-[#0a0518]">
      <div className="sticky top-0 grid h-screen place-items-center">
        <div className="relative">
          <svg width="320" height="320" viewBox="0 0 320 320" className="-rotate-90">
            <circle cx="160" cy="160" r={r} stroke="#ffffff10" strokeWidth="14" fill="none" />
            <circle cx="160" cy="160" r={r} stroke="url(#g)" strokeWidth="14" fill="none" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * (1 - p)} />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="#7a5cff" />
                <stop offset="100%" stopColor="#ff00c8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-6xl font-black tabular-nums text-white">{Math.round(p * 100)}%</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/60">scroll</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}