import { useRef, useState } from "react";
import { useScrollProgress } from "./_useScrollProgress";

const STOPS = [
  ["#050914", "#00e5ff"],
  ["#0f0518", "#ff00c8"],
  ["#05140f", "#a4ff00"],
  ["#14050a", "#ff6a00"],
];

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${m.join(",")})`;
}

export default function Scroll46ColorShift() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useScrollProgress(ref, setP);
  const idx = Math.min(STOPS.length - 2, Math.floor(p * (STOPS.length - 1)));
  const local = p * (STOPS.length - 1) - idx;
  const bg = mix(STOPS[idx][0], STOPS[idx + 1][0], local);
  const fg = mix(STOPS[idx][1], STOPS[idx + 1][1], local);
  return (
    <div ref={ref} className="relative h-[350vh] transition-colors" style={{ background: bg }}>
      <div className="sticky top-0 grid h-screen place-items-center">
        <div className="text-center">
          <div className="mx-auto h-56 w-56 rounded-full blur-2xl opacity-60" style={{ background: fg }} />
          <div className="-mt-40 text-8xl font-black uppercase" style={{ color: fg }}>Shift</div>
          <div className="mt-2 font-mono text-xs uppercase tracking-[0.4em] text-white/60">{Math.round(p * 100)}%</div>
        </div>
      </div>
    </div>
  );
}