import { useEffect, useRef, useState } from "react";

const TEXT = "Design that moves.";

export function TextSplitReveal() {
  const [k, setK] = useState(0);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setK((x) => x + 1), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid min-h-[300px] place-items-center px-6">
      <h2
        key={k}
        ref={ref}
        aria-label={TEXT}
        className="text-4xl md:text-5xl font-semibold tracking-tight text-balance"
      >
        {TEXT.split("").map((ch, i) => (
          <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
            <span
              className="inline-block translate-y-full animate-[splitup_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={{ animationDelay: `${i * 40}ms`, whiteSpace: ch === " " ? "pre" : undefined }}
            >
              {ch}
            </span>
          </span>
        ))}
      </h2>
      <style>{`@keyframes splitup { to { transform: translateY(0); } }`}</style>
    </div>
  );
}