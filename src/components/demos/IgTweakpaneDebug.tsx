import { useState } from "react";
export function IgTweakpaneDebug() {
  const [speed, setSpeed] = useState(1);
  const [amp, setAmp] = useState(40);
  const [color, setColor] = useState("#22d3ee");
  const [glow, setGlow] = useState(true);
  return (
    <div className="grid h-[360px] w-full grid-cols-3 gap-3 rounded-md border border-border bg-[#050510] p-3">
      <div className="relative col-span-2 overflow-hidden rounded border border-white/10 bg-[radial-gradient(circle_at_50%_50%,#0f172a,#000)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,transparent_95%,rgba(255,255,255,0.06)_95%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.06)_95%)] bg-[length:24px_24px]" />
        <svg viewBox="0 0 400 200" className="relative h-full w-full">
          <path
            d={`M 0 100 ${Array.from({ length: 80 })
              .map((_, i) => `L ${i * 5} ${100 + Math.sin(i * 0.25 * speed) * amp}`)
              .join(" ")}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            style={{ filter: glow ? `drop-shadow(0 0 6px ${color})` : "none" }}
          />
        </svg>
        <div className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-widest text-white/50">
          preview · sin(x · {speed.toFixed(2)}) × {amp}
        </div>
        <div className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-widest" style={{ color }}>
          ● live
        </div>
      </div>
      <div className="space-y-3 rounded border border-white/10 bg-white/[0.03] p-3 font-mono text-[10px] uppercase tracking-widest text-white/60">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-white">
          <span>◈ tweakpane</span>
          <span className="text-emerald-400">on</span>
        </div>
        <label className="block space-y-1">
          <div className="flex justify-between">
            <span>speed</span>
            <span className="text-cyan-300 tabular-nums">{speed.toFixed(2)}</span>
          </div>
          <input type="range" min={0.1} max={4} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-cyan-400" />
        </label>
        <label className="block space-y-1">
          <div className="flex justify-between">
            <span>amplitude</span>
            <span className="text-cyan-300 tabular-nums">{amp}</span>
          </div>
          <input type="range" min={0} max={90} value={amp} onChange={(e) => setAmp(+e.target.value)} className="w-full accent-cyan-400" />
        </label>
        <label className="block space-y-1">
          <span>stroke</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-full cursor-pointer bg-transparent" />
        </label>
        <label className="flex cursor-pointer items-center justify-between">
          <span>glow</span>
          <button
            onClick={() => setGlow(!glow)}
            className={`h-4 w-8 rounded-full transition-colors ${glow ? "bg-cyan-400" : "bg-white/20"}`}
          >
            <span className={`block h-3 w-3 rounded-full bg-white transition-transform ${glow ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </label>
      </div>
    </div>
  );
}