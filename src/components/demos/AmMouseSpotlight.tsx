import { useRef, useState } from "react";
import { AM } from "./_am-tokens";

// Mouse Effect — image grid revealed only under a spotlight following the cursor.
export function AmMouseSpotlight() {
  const [p, setP] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);
  const items = Array.from({ length: 24 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className="relative overflow-hidden rounded-md cursor-none"
      style={{ background: AM.bg, height: 520 }}
    >
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-2 p-2">
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-md"
            style={{
              background: `linear-gradient(${(i * 37) % 360}deg, ${AM.cyan}, ${AM.bgSoft})`,
            }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: AM.bg,
          maskImage: `radial-gradient(circle 160px at ${p.x}% ${p.y}%, transparent 0%, transparent 60%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle 160px at ${p.x}% ${p.y}%, transparent 0%, transparent 60%, black 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: 24,
          height: 24,
          transform: "translate(-50%,-50%)",
          border: `1px solid ${AM.cyan}`,
          boxShadow: AM.cyanGlow,
        }}
      />
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: AM.inkFaint }}>
        Mouse Effect · spotlight reveal
      </div>
    </div>
  );
}