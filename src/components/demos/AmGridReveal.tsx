import { useEffect, useRef } from "react";
import { AM } from "./_am-tokens";

// Grid Animation — mosaic tiles with staggered clip-path reveal.
export function AmGridReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tiles = ref.current?.querySelectorAll<HTMLDivElement>("[data-tile]");
    tiles?.forEach((t, i) => {
      t.animate(
        [
          { clipPath: "inset(100% 0 0 0)", opacity: 0 },
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
        ],
        { duration: 900, delay: 60 + i * 50, easing: AM.easeOut, fill: "both" },
      );
    });
  }, []);
  return (
    <div className="relative rounded-md p-6" style={{ background: AM.bg, minHeight: 520 }}>
      <div className="mb-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: AM.inkFaint }}>
        Grid · staggered clip reveal
      </div>
      <div ref={ref} className="grid grid-cols-4 gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            data-tile
            className="aspect-square rounded-xl"
            style={{
              background: i % 5 === 0
                ? `linear-gradient(135deg, ${AM.cyan}, ${AM.bgSoft})`
                : AM.bgSoft,
              border: `1px solid ${AM.rule}`,
              boxShadow: i % 5 === 0 ? AM.cyanGlow : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}