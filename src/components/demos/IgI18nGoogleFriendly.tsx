import { useState } from "react";
import { IG } from "./_ig-tokens";

const LOCALES = [
  {
    code: "en", flag: "🇬🇧", url: "immersive-g.com/en/work",
    title: "Selected Work", greeting: "Hello.",
    nav: ["Work", "Studio", "Journal", "Contact"],
  },
  {
    code: "fr", flag: "🇫🇷", url: "immersive-g.com/fr/travaux",
    title: "Nos travaux", greeting: "Bonjour.",
    nav: ["Travaux", "Studio", "Journal", "Contact"],
  },
  {
    code: "ja", flag: "🇯🇵", url: "immersive-g.com/ja/works",
    title: "制作実績", greeting: "こんにちは。",
    nav: ["制作実績", "スタジオ", "ジャーナル", "お問合せ"],
  },
];

export function IgI18nGoogleFriendly() {
  const [i, setI] = useState(0);
  const l = LOCALES[i];
  return (
    <div
      className="relative h-[360px] w-full overflow-hidden rounded-md border p-4"
      style={{ background: IG.bg, borderColor: IG.rule }}
    >
      {/* browser chrome */}
      <div
        key={i}
        className="relative h-full overflow-hidden rounded-sm border"
        style={{
          borderColor: IG.rule,
          background: IG.bgSoft,
          animation: `ig-i18n-in 700ms ${IG.easeOut}`,
        }}
      >
        {/* url bar */}
        <div
          className="flex items-center gap-2 border-b px-3 py-2"
          style={{ borderColor: IG.rule }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: IG.inkFaint }} />
          <span className="h-2 w-2 rounded-full" style={{ background: IG.inkFaint }} />
          <span className="h-2 w-2 rounded-full" style={{ background: IG.inkFaint }} />
          <div
            className="ml-3 flex flex-1 items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px]"
            style={{ background: IG.surface, color: IG.inkMuted }}
          >
            <span style={{ color: IG.accent }}>◉</span>
            <span style={{ color: IG.inkFaint }}>https://</span>
            <span style={{ color: IG.ink }}>{l.url}</span>
          </div>
          <div
            className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{ color: IG.inkFaint }}
          >
            <span>{l.flag}</span>
            <span>{l.code}</span>
          </div>
        </div>

        {/* rendered page */}
        <div className="relative h-[calc(100%-33px)] p-6" style={{ background: IG.bg, color: IG.ink }}>
          <nav
            className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: IG.inkMuted }}
          >
            <span className="font-serif text-base italic" style={{ color: IG.ink }}>
              Immersive Garden
            </span>
            <div className="flex gap-5">
              {l.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </nav>

          <div className="relative mt-10 flex flex-col items-start">
            <div
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: IG.accent }}
            >
              {l.greeting}
            </div>
            <h4
              className="mt-2 font-serif text-5xl italic leading-none"
              style={{ color: IG.ink }}
            >
              {l.title}
            </h4>
            <div
              className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em]"
              style={{ color: IG.inkFaint }}
            >
              <span className="rounded-full border px-2 py-0.5" style={{ borderColor: IG.rule }}>
                hreflang · {l.code}
              </span>
              <span className="rounded-full border px-2 py-0.5" style={{ borderColor: IG.rule }}>
                canonical
              </span>
              <span className="rounded-full border px-2 py-0.5" style={{ borderColor: IG.rule }}>
                og:locale
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* locale switcher */}
      <div
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border p-1"
        style={{ borderColor: IG.rule, background: IG.bgSoft }}
      >
        {LOCALES.map((x, n) => (
          <button
            key={x.code}
            onClick={() => setI(n)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{
              background: n === i ? IG.accent : "transparent",
              color: n === i ? IG.ink : IG.inkMuted,
              transition: `background 400ms ${IG.ease}, color 400ms ${IG.ease}`,
            }}
          >
            <span>{x.flag}</span>
            {x.code}
          </button>
        ))}
      </div>

      <style>{`@keyframes ig-i18n-in{from{opacity:0;transform:translate3d(0,10px,0)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}