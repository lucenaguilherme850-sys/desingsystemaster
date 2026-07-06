import { useRef } from "react";
import { IG } from "./_ig-tokens";

const BLOBS = [
  { c1: "#FF5B1F", c2: "#FFB199", x: 20, y: 30 },
  { c1: "#7C5CFF", c2: "#22D3EE", x: 70, y: 25 },
  { c1: "#FFD166", c2: "#FF5B1F", x: 45, y: 70 },
];

export function StMerciMichelBlobs() {
  const wrap = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = wrap.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.querySelectorAll<HTMLDivElement>("[data-blob]").forEach((b, i) => {
      const dx = (px - 0.5) * (40 + i * 20);
      const dy = (py - 0.5) * (40 + i * 20);
      b.style.transform = `translate(${dx}px, ${dy}px) scale(${1 + (i % 2) * 0.1})`;
    });
  };

  return (
    <div
      ref={wrap}
      onMouseMove={onMove}
      className="relative min-h-[420px] overflow-hidden rounded-md"
      style={{ background: IG.bone }}
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          data-blob
          className="absolute size-[320px] rounded-full transition-transform duration-500 ease-out will-change-transform"
          style={{
            left: `${b.x}%`, top: `${b.y}%`,
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle at 30% 30%, ${b.c1}, ${b.c2} 60%, transparent 80%)`,
            filter: "blur(30px)", mixBlendMode: "multiply",
          }}
        />
      ))}
      <div className="pointer-events-none relative z-10 grid h-[420px] place-items-center">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: "#00000080" }}>Merci-Michel</div>
          <div className="mt-3 font-serif text-6xl italic" style={{ color: "#0A0A0A", letterSpacing: -2 }}>
            bon·bon
          </div>
          <div className="mt-2 font-mono text-[11px]" style={{ color: "#00000066" }}>move the mouse · gradient blobs</div>
        </div>
      </div>
    </div>
  );
}