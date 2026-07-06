import { useState } from "react";
import { IG } from "./_ig-tokens";

const ROUTES = [
  { url: "/index", title: "Immersive Garden", sub: "Digital studio, since 2011" },
  { url: "/work", title: "Selected work", sub: "24 projects · 12 awards" },
  { url: "/studio", title: "The studio", sub: "Paris · Montréal · Tokyo" },
  { url: "/contact", title: "Get in touch", sub: "hello@immersive-g.com" },
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
    <div
      className="flex h-[360px] w-full flex-col overflow-hidden rounded-md border"
      style={{ background: IG.bg, borderColor: IG.rule }}
    >
      <nav
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: IG.rule }}
      >
        <div
          className="font-serif text-lg italic"
          style={{ color: IG.ink }}
        >
          Immersive Garden
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em]">
          {ROUTES.map((x, n) => (
            <button
              key={x.url}
              onClick={() => go(n)}
              className="rounded-sm px-2.5 py-1"
              style={{
                color: n === i ? IG.accent : IG.inkMuted,
                transition: `color 400ms ${IG.ease}`,
              }}
            >
              {x.url}
            </button>
          ))}
        </div>
      </nav>
      <div key={key} className="relative flex-1 overflow-hidden">
        {/* curtain reveal */}
        <div
          className="absolute inset-0"
          style={{
            background: IG.ink,
            transformOrigin: "top",
            animation: `ig-curtain 900ms ${IG.ease} forwards`,
          }}
        />
        <div
          className="absolute inset-0 flex flex-col items-start justify-center gap-4 px-12"
          style={{ opacity: 0, animation: `ig-page-in 700ms 500ms ${IG.easeOut} forwards`, color: IG.ink }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: IG.accent }}
          >
            {r.url}
          </div>
          <div className="font-serif text-6xl italic leading-none">{r.title}</div>
          <div className="font-mono text-xs uppercase tracking-widest" style={{ color: IG.inkMuted }}>
            {r.sub}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ig-curtain { 0%{transform:scaleY(1)} 60%{transform:scaleY(1)} 100%{transform:scaleY(0)} }
        @keyframes ig-page-in { from{opacity:0;transform:translate3d(0,24px,0)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}