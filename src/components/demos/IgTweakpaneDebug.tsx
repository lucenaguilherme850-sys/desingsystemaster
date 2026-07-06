import { useState } from "react";
export function IgTweakpaneDebug() {
  const [speed, setSpeed] = useState(1);
  const [amp, setAmp] = useState(40);
  const [color, setColor] = useState("#3B6EF5");
  return (
    <div className="grid h-[360px] w-full grid-cols-3 gap-3 rounded-md border border-border bg-background p-3">
      <div className="relative col-span-2 overflow-hidden rounded border border-border bg-black">
        <svg viewBox="0 0 400 200" className="h-full w-full">
          <path
            d={`M 0 100 ${Array.from({ length: 40 })
              .map((_, i) => `L ${i * 10} ${100 + Math.sin(i * 0.5 * speed) * amp}`)
              .join(" ")}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="space-y-3 rounded border border-border bg-card p-3 font-mono text-[10px] uppercase text-muted-foreground">
        <div className="text-foreground">debug · pane</div>
        <label className="block space-y-1">
          <span>speed {speed.toFixed(2)}</span>
          <input type="range" min={0.1} max={4} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full" />
        </label>
        <label className="block space-y-1">
          <span>amp {amp}</span>
          <input type="range" min={0} max={90} value={amp} onChange={(e) => setAmp(+e.target.value)} className="w-full" />
        </label>
        <label className="block space-y-1">
          <span>color</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-full bg-transparent" />
        </label>
      </div>
    </div>
  );
}