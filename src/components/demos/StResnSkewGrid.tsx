import { useRef } from "react";
import { IG } from "./_ig-tokens";

const TILES = Array.from({ length: 36 });

export function StResnSkewGrid() {
  const wrap = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = wrap.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    el.querySelectorAll<HTMLDivElement>("[data-tile]").forEach((t) => {
      const tr = t.getBoundingClientRect();
      const cx = tr.left - r.left + tr.width / 2;
      const cy = tr.top - r.top + tr.height / 2;
      const dx = (mx - cx) / 60;
      const dy = (my - cy) / 60;
      const dist = Math.hypot(mx - cx, my - cy);
      const push = Math.max(0, 1 - dist / 260);
      t.style.transform = `translate(${dx * push * 8}px, ${dy * push * 8}px) skew(${dx * push * 6}deg, ${dy * push * 6}deg) scale(${1 + push * 0.15})`;
      t.style.background = push > 0.4 ? IG.accent : IG.bgSoft;
    });
  };
  const onLeave = () => {
    wrap.current?.querySelectorAll<HTMLDivElement>("[data-tile]").forEach((t) => {
      t.style.transform = "";
      t.style.background = IG.bgSoft;
    });
  };

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md p-6" style={{ background: IG.bg }}>
      <div
        ref={wrap}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="grid h-[360px] cursor-crosshair grid-cols-6 gap-2"
      >
        {TILES.map((_, i) => (
          <div
            key={i}
            data-tile
            className="rounded-sm transition-[transform,background] duration-200 ease-out will-change-transform"
            style={{ background: IG.bgSoft }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: IG.inkFaint }}>
        Resn · playful skew grid
      </div>
    </div>
  );
}