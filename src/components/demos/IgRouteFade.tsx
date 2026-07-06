import { useState } from "react";
const ROUTES = [
  { url: "/index", title: "Immersive Garden", sub: "Digital studio, since 2011", bg: "linear-gradient(135deg,#0f172a,#1e3a8a,#38bdf8)" },
  { url: "/work", title: "Selected work", sub: "24 projects · 12 awards", bg: "linear-gradient(135deg,#4a044e,#a21caf,#f472b6)" },
  { url: "/studio", title: "The studio", sub: "Paris · Montréal · Tokyo", bg: "linear-gradient(135deg,#052e16,#166534,#facc15)" },
  { url: "/contact", title: "Get in touch", sub: "hello@immersive-g.com", bg: "linear-gradient(135deg,#450a0a,#f97316,#fde047)" },
];
export function IgRouteFade() {
  const [i, setI] = useState(0);
  const [key, setKey] = useState(0);
  const go = (n: number) => {
    setI(n);
    setKey((k) => k + 1);
  };
  const r = ROUTES[i];
  return (
    <div className="flex h-[360px] w-full flex-col overflow-hidden rounded-md border border-border bg-black">
      <nav className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">◆ ig</div>
        <div className="flex items-center gap-1 font-mono text-[10px] uppercase">
          {ROUTES.map((x, n) => (
            <button
              key={x.url}
              onClick={() => go(n)}
              className={`rounded px-2.5 py-1 transition-colors ${
                n === i ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {x.url}
            </button>
          ))}
        </div>
      </nav>
      <div key={key} className="relative flex-1 overflow-hidden" style={{ background: r.bg }}>
        <div
          className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-10 opacity-0"
          style={{ animation: "ig-fade-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards" }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
            {r.url} · enter 600ms
          </div>
          <div className="font-serif text-5xl italic text-white">{r.title}</div>
          <div className="font-mono text-xs text-white/80">{r.sub}</div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.5),transparent_60%)]" />
      </div>
      <style>{`@keyframes ig-fade-in{from{opacity:0;transform:translate3d(0,24px,0)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}