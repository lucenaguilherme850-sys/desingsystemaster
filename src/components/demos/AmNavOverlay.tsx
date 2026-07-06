import { useState } from "react";
import { AM } from "./_am-tokens";

// Navigation Menu — fullscreen overlay with staggered links + word underline hover.
const LINKS = ["Work", "Studio", "Journal", "Contact"];

export function AmNavOverlay() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-md" style={{ background: AM.bg, minHeight: 520 }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div style={{ color: AM.ink, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>◐ Studio</div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs"
          style={{ border: `1px solid ${AM.rule}`, color: AM.ink }}
        >
          <span className="flex flex-col gap-1">
            <span className="block h-px w-4" style={{ background: AM.ink }} />
            <span className="block h-px w-4" style={{ background: AM.ink }} />
          </span>
          MENU
        </button>
      </div>

      <div className="grid place-items-center py-20 text-center" style={{ color: AM.inkFaint }}>
        <div className="font-mono text-xs uppercase tracking-widest">click MENU</div>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${AM.bgSoft}, ${AM.bg})`,
          clipPath: open ? "circle(150% at 90% 5%)" : "circle(0% at 90% 5%)",
          transition: `clip-path 900ms ${AM.ease}`,
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div style={{ color: AM.ink, fontSize: 18, fontWeight: 700 }}>◐ Studio</div>
          <button onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-xs" style={{ border: `1px solid ${AM.rule}`, color: AM.ink }}>
            CLOSE ×
          </button>
        </div>
        <ul className="mt-16 flex flex-col items-start gap-4 pl-16">
          {LINKS.map((l, i) => (
            <li
              key={l}
              className="group cursor-pointer overflow-hidden"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(40px)",
                transition: `opacity 700ms ${AM.easeOut} ${200 + i * 80}ms, transform 700ms ${AM.easeOut} ${200 + i * 80}ms`,
              }}
            >
              <div className="relative inline-block" style={{ color: AM.ink, fontSize: 72, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {l}
                <span
                  className="absolute -bottom-1 left-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ width: "100%", background: AM.cyan, boxShadow: AM.cyanGlow }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}