import { useState } from "react";
import { AM } from "./_am-tokens";

// Slider — 3D card stack, prev/next with rotation & depth.
const CARDS = [
  { t: "OFFSCREEN", n: "01", c: "#4CD3FF" },
  { t: "AURORA", n: "02", c: "#8B7CFF" },
  { t: "SIGNAL", n: "03", c: "#FF7CA3" },
  { t: "PIXEL", n: "04", c: "#7CFFB1" },
  { t: "CINEMA", n: "05", c: "#FFC96B" },
];

export function AmSliderStack() {
  const [i, setI] = useState(0);
  const n = CARDS.length;
  const next = () => setI((v) => (v + 1) % n);
  const prev = () => setI((v) => (v - 1 + n) % n);
  return (
    <div className="relative overflow-hidden rounded-md grid place-items-center" style={{ background: AM.bg, minHeight: 520, perspective: 1600 }}>
      <div className="relative h-[320px] w-[260px]" style={{ transformStyle: "preserve-3d" }}>
        {CARDS.map((c, idx) => {
          const off = (idx - i + n) % n;
          const dir = off <= n / 2 ? off : off - n;
          return (
            <div
              key={idx}
              className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
              style={{
                background: `linear-gradient(160deg, ${c.c}22, ${AM.bgSoft})`,
                border: `1px solid ${AM.rule}`,
                boxShadow: dir === 0 ? AM.cyanGlow : "0 20px 60px rgba(0,0,0,0.5)",
                transform: `translateX(${dir * 40}px) translateZ(${-Math.abs(dir) * 80}px) rotateY(${dir * -8}deg)`,
                transition: `transform 700ms ${AM.ease}, box-shadow 500ms ${AM.ease}`,
                zIndex: 100 - Math.abs(dir),
                opacity: Math.abs(dir) > 2 ? 0 : 1,
              }}
            >
              <div className="font-mono text-xs" style={{ color: AM.inkFaint }}>{c.n} / {n}</div>
              <div>
                <div style={{ color: c.c, fontSize: 40, fontWeight: 900, letterSpacing: "-0.02em", textShadow: `0 0 30px ${c.c}66` }}>
                  {c.t}
                </div>
                <div className="mt-2 font-mono text-[10px]" style={{ color: AM.inkMuted }}>drag · scroll · click</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-6 flex gap-2">
        <button onClick={prev} className="rounded-full px-4 py-2 text-xs" style={{ border: `1px solid ${AM.rule}`, color: AM.ink }}>← prev</button>
        <button onClick={next} className="rounded-full px-4 py-2 text-xs" style={{ background: AM.cyan, color: AM.bg, boxShadow: AM.cyanGlow }}>next →</button>
      </div>
    </div>
  );
}