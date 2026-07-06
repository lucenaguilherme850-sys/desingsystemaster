import { useState } from "react";
import { FA } from "./_followart-tokens";

// FOLLOW.ART "Join" CTA: fixed black block with a white arrow disc that
// grows and shifts on hover, the site's persistent bottom-right action.
export function StFollowJoinCta() {
  const [hover, setHover] = useState(false);
  const rows = ["Artist", "Curator", "Collector", "Gallery", "Writer"];
  return (
    <div className="relative min-h-[520px] overflow-hidden" style={{ background: FA.orange }}>
      <div className="absolute inset-0 p-10" style={{ fontFamily: FA.body, color: FA.white }}>
        <div style={{ fontSize: 12, letterSpacing: "0.2em" }}>JOIN AS —</div>
        <ul className="mt-6 space-y-2" style={{ fontFamily: FA.display, fontStretch: "condensed", fontWeight: 900, fontSize: "clamp(60px, 9vw, 140px)", lineHeight: 0.9, letterSpacing: "-0.01em" }}>
          {rows.map((r, i) => (
            <li key={r} className="group flex cursor-pointer items-baseline gap-4 transition-colors" style={{ color: FA.white }}>
              <span style={{ fontFamily: FA.body, fontSize: 14, color: FA.ink60, minWidth: 44, fontWeight: 400 }}>
                0{i + 1}
              </span>
              <span className="transition-transform duration-500 group-hover:translate-x-4" style={{ transitionTimingFunction: FA.easeOut }}>
                {r}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="absolute bottom-8 right-8 flex items-center overflow-hidden"
        style={{
          background: FA.black, color: FA.white,
          height: 68,
          paddingLeft: 20, paddingRight: 20,
          width: hover ? 260 : 180,
          transition: `width 600ms ${FA.easeOut}`,
          fontFamily: FA.body, fontSize: 18,
        }}
      >
        <span
          className="grid place-items-center rounded-full"
          style={{
            width: 34, height: 34,
            background: FA.white, color: FA.black,
            transform: hover ? "rotate(45deg) scale(1.15)" : "rotate(0)",
            transition: `transform 600ms ${FA.easeOut}`,
          }}
        >→</span>
        <span className="ml-4 flex-1 text-left">{hover ? "Become a member" : "Join"}</span>
      </button>
    </div>
  );
}