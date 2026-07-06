import { useState } from "react";
import { IG } from "./_ig-tokens";

export function IgTweakpaneDebug() {
  const [speed, setSpeed] = useState(1);
  const [amp, setAmp] = useState(40);
  const [color, setColor] = useState(IG.accent);
  const [glow, setGlow] = useState(false);
  return (
    <div
      className="grid h-[360px] w-full grid-cols-3 gap-3 rounded-md border p-3"
      style={{ background: IG.bg, borderColor: IG.rule }}
    >
      <div
        className="relative col-span-2 overflow-hidden rounded-sm border"
        style={{ borderColor: IG.rule, background: IG.bgSoft }}
      >
        <svg viewBox="0 0 400 200" className="relative h-full w-full">
          <path
            d={`M 0 100 ${Array.from({ length: 80 })
              .map((_, i) => `L ${i * 5} ${100 + Math.sin(i * 0.25 * speed) * amp}`)
              .join(" ")}`}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            style={{ filter: glow ? `drop-shadow(0 0 4px ${color})` : "none" }}
          />
        </svg>
        <div
          className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ color: IG.inkFaint }}
        >
          preview — sin(x · {speed.toFixed(2)}) × {amp}
        </div>
        <div
          className="absolute bottom-4 right-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ color: IG.inkMuted }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          live
        </div>
      </div>
      <div
        className="space-y-4 rounded-sm border p-3 font-mono text-[10px] uppercase tracking-[0.25em]"
        style={{ borderColor: IG.rule, background: IG.surface, color: IG.inkMuted }}
      >
        <div
          className="flex items-center justify-between border-b pb-2"
          style={{ borderColor: IG.rule, color: IG.ink }}
        >
          <span>Tweakpane</span>
          <span style={{ color: IG.accent }}>on</span>
        </div>
        <label className="block space-y-1.5">
          <div className="flex justify-between">
            <span>speed</span>
            <span className="tabular-nums" style={{ color: IG.ink }}>{speed.toFixed(2)}</span>
          </div>
          <input type="range" min={0.1} max={4} step={0.1} value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
            className="w-full" style={{ accentColor: IG.accent }} />
        </label>
        <label className="block space-y-1.5">
          <div className="flex justify-between">
            <span>amplitude</span>
            <span className="tabular-nums" style={{ color: IG.ink }}>{amp}</span>
          </div>
          <input type="range" min={0} max={90} value={amp}
            onChange={(e) => setAmp(+e.target.value)}
            className="w-full" style={{ accentColor: IG.accent }} />
        </label>
        <label className="block space-y-1.5">
          <span>stroke</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
            className="h-8 w-full cursor-pointer border-none bg-transparent" />
        </label>
        <label className="flex cursor-pointer items-center justify-between">
          <span>glow</span>
          <button
            onClick={() => setGlow(!glow)}
            className="h-4 w-8 rounded-full"
            style={{
              background: glow ? IG.accent : IG.rule,
              transition: `background 300ms ${IG.ease}`,
            }}
          >
            <span
              className="block h-3 w-3 rounded-full"
              style={{
                background: IG.ink,
                transform: glow ? "translateX(18px)" : "translateX(2px)",
                transition: `transform 300ms ${IG.ease}`,
              }}
            />
          </button>
        </label>
      </div>
    </div>
  );
}