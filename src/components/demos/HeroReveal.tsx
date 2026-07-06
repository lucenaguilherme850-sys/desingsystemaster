import { useEffect, useRef, useState } from "react";

export function HeroReveal() {
  const [k, setK] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => setK((x) => x + 1), 50);
    return () => clearTimeout(t);
  }, []);

  const items = [
    { className: "font-mono text-xs uppercase tracking-[0.2em] text-neon", text: "// hero.reveal" },
    { className: "text-4xl md:text-5xl font-semibold tracking-tight text-balance", text: "Design that moves before you scroll." },
    { className: "text-muted-foreground max-w-md", text: "A cinematic cascade — kicker, headline, subtitle and CTA stagger in with easing." },
    { className: "flex gap-2 pt-2", node: (
      <>
        <button className="rounded-md bg-neon px-4 py-2 font-mono text-xs text-background">Ship it</button>
        <button className="rounded-md border border-border px-4 py-2 font-mono text-xs">Preview</button>
      </>
    ) },
  ];

  return (
    <div ref={rootRef} key={k} className="min-h-[300px] flex flex-col justify-center gap-3 px-6">
      {items.map((item, i) => (
        <div
          key={i}
          className={"opacity-0 translate-y-4 animate-[reveal_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards] " + (item.className ?? "")}
          style={{ animationDelay: `${i * 90}ms` }}
        >
          {item.node ?? item.text}
        </div>
      ))}
      <style>{`@keyframes reveal { to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}