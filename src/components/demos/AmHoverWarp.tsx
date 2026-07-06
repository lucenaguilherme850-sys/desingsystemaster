import { useRef, useState } from "react";
import { AM } from "./_am-tokens";

// Hover Effect — list rows reveal a warped preview panel following the cursor.
const ITEMS = [
  { name: "Aurora Studios", tag: "Motion / 2024", c: "#4CD3FF" },
  { name: "Offscreen Films", tag: "Direction / 2023", c: "#8B7CFF" },
  { name: "Signal Ninety", tag: "Brand / 2024", c: "#FF7CA3" },
  { name: "Pixel Culture", tag: "Editorial / 2022", c: "#7CFFB1" },
  { name: "Cinema Prime", tag: "Web / 2025", c: "#FFC96B" },
];

export function AmHoverWarp() {
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={wrap}
      onMouseMove={(e) => {
        const r = wrap.current!.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className="relative overflow-hidden rounded-md"
      style={{ background: AM.bg, minHeight: 520 }}
    >
      <ul className="relative z-10 divide-y" style={{ borderColor: AM.rule }}>
        {ITEMS.map((it, i) => (
          <li
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="flex items-center justify-between px-8 py-8 cursor-pointer transition-colors"
            style={{
              borderTop: i ? `1px solid ${AM.rule}` : "none",
              color: hover === i ? AM.cyan : AM.ink,
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", transform: hover === i ? "translateX(24px)" : "translateX(0)", transition: `transform 500ms ${AM.easeOut}, color 300ms` }}>
              {it.name}
            </span>
            <span className="font-mono text-xs" style={{ color: AM.inkFaint }}>{it.tag}</span>
          </li>
        ))}
      </ul>
      {hover !== null && (
        <div
          className="pointer-events-none absolute rounded-xl"
          style={{
            left: pos.x,
            top: pos.y,
            width: 260,
            height: 180,
            transform: `translate(-50%,-50%) rotate(${(pos.x % 40) - 20}deg)`,
            transition: "transform 200ms ease-out",
            background: `linear-gradient(135deg, ${ITEMS[hover].c}, ${AM.bgSoft})`,
            boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${ITEMS[hover].c}55`,
            border: `1px solid ${AM.rule}`,
          }}
        />
      )}
    </div>
  );
}