import { useState } from "react";

const LOCALES = [
  {
    code: "en", flag: "🇬🇧", url: "immersive-g.com/en/work",
    title: "Selected Work", greeting: "Hello.",
    nav: ["Work", "Studio", "Journal", "Contact"],
    bg: "linear-gradient(135deg,#0f172a,#1e40af,#38bdf8)",
  },
  {
    code: "fr", flag: "🇫🇷", url: "immersive-g.com/fr/travaux",
    title: "Nos travaux", greeting: "Bonjour.",
    nav: ["Travaux", "Studio", "Journal", "Contact"],
    bg: "linear-gradient(135deg,#4c0519,#e11d48,#fda4af)",
  },
  {
    code: "ja", flag: "🇯🇵", url: "immersive-g.com/ja/works",
    title: "制作実績", greeting: "こんにちは。",
    nav: ["制作実績", "スタジオ", "ジャーナル", "お問合せ"],
    bg: "linear-gradient(135deg,#1c1917,#a855f7,#f0abfc)",
  },
];

export function IgI18nGoogleFriendly() {
  const [i, setI] = useState(0);
  const l = LOCALES[i];
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border bg-[#050510] p-4">
      {/* browser chrome */}
      <div
        key={i}
        className="relative h-full overflow-hidden rounded border border-white/10 shadow-2xl"
        style={{ animation: "ig-i18n-in 0.55s cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* url bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-full bg-white/5 px-3 py-1 font-mono text-[10px] text-white/70">
            <span className="text-emerald-400">◉</span>
            <span className="text-white/40">https://</span>
            <span>{l.url}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
            <span>{l.flag}</span>
            <span>{l.code}</span>
          </div>
        </div>

        {/* rendered page */}
        <div className="relative h-[calc(100%-33px)] p-5" style={{ background: l.bg }}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

          <nav className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/90">
            <span>◆ ig</span>
            <div className="flex gap-4">
              {l.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </nav>

          <div className="relative mt-8 flex flex-col items-start">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
              {l.greeting}
            </div>
            <h4 className="mt-2 font-serif text-4xl italic leading-tight text-white">
              {l.title}
            </h4>
            <div className="mt-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest text-white/70">
              <span className="rounded-full border border-white/30 px-2 py-0.5">hreflang · {l.code}</span>
              <span className="rounded-full border border-white/30 px-2 py-0.5">canonical</span>
              <span className="rounded-full border border-white/30 px-2 py-0.5">og:locale</span>
            </div>
          </div>
        </div>
      </div>

      {/* locale switcher */}
      <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-white/20 bg-black/60 p-1 backdrop-blur">
        {LOCALES.map((x, n) => (
          <button
            key={x.code}
            onClick={() => setI(n)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-widest transition-all ${
              n === i ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            <span>{x.flag}</span>
            {x.code}
          </button>
        ))}
      </div>

      <style>{`@keyframes ig-i18n-in{from{opacity:0;transform:translate3d(0,10px,0) scale(0.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}