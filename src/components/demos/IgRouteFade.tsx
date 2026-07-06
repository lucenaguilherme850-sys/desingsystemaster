import { useState } from "react";
const ROUTES = ["/home", "/work", "/studio", "/contact"];
export function IgRouteFade() {
  const [i, setI] = useState(0);
  const [key, setKey] = useState(0);
  const go = (n: number) => {
    setI(n);
    setKey((k) => k + 1);
  };
  return (
    <div className="flex h-[360px] w-full flex-col overflow-hidden rounded-md border border-border bg-background">
      <nav className="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">
        {ROUTES.map((r, n) => (
          <button
            key={r}
            onClick={() => go(n)}
            className={`rounded px-2 py-1 transition-colors ${
              n === i ? "bg-primary text-primary-foreground" : "hover:bg-card"
            }`}
          >
            {r}
          </button>
        ))}
      </nav>
      <div key={key} className="relative flex-1">
        <div
          className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-8 opacity-0"
          style={{ animation: "ig-fade-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards" }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            transition · fade + rise
          </div>
          <div className="font-mono text-4xl text-foreground">{ROUTES[i]}</div>
          <div className="font-mono text-xs text-muted-foreground">page enter 600ms · leave 400ms</div>
        </div>
      </div>
      <style>{`@keyframes ig-fade-in{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}