import { useEffect, useRef, useState } from "react";

const CHAPTERS = [
  "I. Signal",
  "II. Threshold",
  "III. Drift",
  "IV. Chorus",
  "V. Afterimage",
];
const LINES = [
  "The screen breathes in cyan and returns violet.",
  "A cursor becomes a compass; the compass becomes weather.",
  "Every scroll is a small negotiation with gravity.",
  "We keep the noise, we trade the silence.",
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
    <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border bg-gradient-to-b from-[#0a0b14] to-[#12131f]">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-white/5">
        <div
          className="h-full transition-[width] duration-75"
          style={{
            width: `${p * 100}%`,
            background: "linear-gradient(90deg,#22d3ee,#a855f7,#f472b6)",
            boxShadow: "0 0 12px rgba(168,85,247,0.6)",
          }}
        />
      </div>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
        reading · {String(Math.round(p * 100)).padStart(3, "0")}
      </div>
      <div ref={scrollRef} className="h-full overflow-auto px-8 pt-10 pb-8 font-serif text-white/80">
        {CHAPTERS.map((c, ci) => (
          <div key={c} className="mb-10">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/80">
              chapter {ci + 1}
            </div>
            <h4 className="mb-4 text-2xl italic text-white">{c}</h4>
            {LINES.map((l, i) => (
              <p key={i} className="mb-3 text-sm leading-relaxed text-white/60">
                {l}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}