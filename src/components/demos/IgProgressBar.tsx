import { useEffect, useRef, useState } from "react";

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
    <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border bg-background">
      <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-border">
        <div className="h-full bg-primary transition-[width] duration-75" style={{ width: `${p * 100}%` }} />
      </div>
      <div className="absolute right-3 top-3 z-10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {Math.round(p * 100)}%
      </div>
      <div ref={scrollRef} className="h-full overflow-auto p-6 pt-8 font-mono text-xs text-muted-foreground">
        {Array.from({ length: 30 }).map((_, i) => (
          <p key={i} className="mb-3 leading-relaxed">
            {String(i + 1).padStart(2, "0")} · scroll · line · vertical · progress · bar · sync
          </p>
        ))}
      </div>
    </div>
  );
}