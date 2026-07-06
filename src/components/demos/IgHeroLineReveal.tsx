import { useCallback, useEffect, useRef, useState } from "react";

const LINES = [
  "Supere tudo o que já viu",
  "ou sentiu, criando",
  "experiências incomparáveis",
  "para marcas ambiciosas.",
];

export function IgHeroLineReveal() {
  const [key, setKey] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const replay = useCallback(() => setKey((k) => k + 1), []);

  useEffect(() => {
    replay();
  }, [replay]);

  return (
    <div className="space-y-4">
      <div
        ref={rootRef}
        key={key}
        className="relative overflow-hidden rounded-md border border-border bg-card p-8 min-h-[320px] grid-bg"
      >
        <h1 className="font-serif text-3xl leading-[1.15] tracking-tight md:text-4xl">
          {LINES.map((line, i) => (
            <span
              key={i}
              className="block overflow-hidden"
              style={{ height: "1.15em" }}
            >
              <span
                className="inline-block will-change-transform"
                style={{
                  animation: "ig-line-up 0.9s cubic-bezier(0.165,0.84,0.44,1) both",
                  animationDelay: `${0.15 + i * 0.09}s`,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
      </div>
      <button
        onClick={replay}
        className="rounded-full border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-neon hover:text-foreground"
      >
        replay
      </button>
      <style>{`@keyframes ig-line-up { from { transform: translate3d(0, 100%, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }`}</style>
    </div>
  );
}