import { useEffect, useRef, useState } from "react";
import { IG } from "./_ig-tokens";

const CHAPTERS = ["I. Signal", "II. Threshold", "III. Drift", "IV. Chorus", "V. Afterimage"];
const LINES = [
  "The screen breathes in and returns silence.",
  "A cursor becomes a compass; the compass becomes weather.",
  "Every scroll is a small negotiation with gravity.",
  "We keep the noise, we trade the flourish.",
  "Motion is not decoration — it is punctuation.",
  "The grid remembers what the eye forgets.",
];

export function IgProgressBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const on = () => {
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? el.scrollTop / max : 0);
    };
    el.addEventListener("scroll", on);
    on();
    return () => el.removeEventListener("scroll", on);
  }, []);
  return (
    <div
      className="relative h-[360px] w-full overflow-hidden rounded-md border"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-px" style={{ background: IG.rule }}>
        <div
          className="h-full transition-[width] duration-100"
          style={{ width: `${p * 100}%`, background: IG.accent, transitionTimingFunction: "linear" }}
        />
      </div>
      <div
        className="absolute right-4 top-4 z-10 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkMuted }}
      >
        {String(Math.round(p * 100)).padStart(3, "0")} / 100
      </div>
      <div ref={scrollRef} className="h-full overflow-auto px-10 pt-12 pb-10">
        {CHAPTERS.map((c, ci) => (
          <div key={c} className="mb-12">
            <div
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: IG.inkFaint }}
            >
              — Chapter {ci + 1}
            </div>
            <h4 className="mb-5 font-serif text-3xl italic" style={{ color: IG.ink }}>
              {c}
            </h4>
            {LINES.map((l, i) => (
              <p
                key={i}
                className="mb-3 max-w-[50ch] text-sm leading-relaxed"
                style={{ color: IG.inkMuted }}
              >
                {l}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}