import { useState } from "react";
const LOCALES = [
  { code: "en", flag: "🇬🇧", url: "/en/work", title: "Selected Work — IG Studio", hreflang: "en", greeting: "Hello" },
  { code: "fr", flag: "🇫🇷", url: "/fr/travaux", title: "Nos travaux — Studio IG", hreflang: "fr", greeting: "Bonjour" },
  { code: "ja", flag: "🇯🇵", url: "/ja/works", title: "制作実績 — IG スタジオ", hreflang: "ja", greeting: "こんにちは" },
];
export function IgI18nGoogleFriendly() {
  const [i, setI] = useState(0);
  const l = LOCALES[i];
  return (
    <div className="h-[360px] w-full space-y-3 rounded-md border border-border bg-[#050510] p-6 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {LOCALES.map((x, n) => (
            <button
              key={x.code}
              onClick={() => setI(n)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest transition-all ${
                n === i
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              <span>{x.flag}</span>
              {x.code}
            </button>
          ))}
        </div>
        <span className="font-serif text-lg italic text-white/80">{l.greeting}.</span>
      </div>
      <div className="rounded border border-white/10 bg-white/[0.03] p-4 text-xs text-white">
        <div className="text-[10px] uppercase tracking-widest text-cyan-300">canonical url</div>
        <div className="mt-1 text-base">
          <span className="text-white/40">immersive-g.com</span>
          <span className="text-emerald-300">{l.url}</span>
        </div>
        <div className="mt-3 text-[10px] uppercase tracking-widest text-cyan-300">&lt;title&gt;</div>
        <div className="mt-1 font-serif text-base italic">{l.title}</div>
      </div>
      <div className="rounded border border-white/10 bg-white/[0.03] p-4 text-[10px] leading-relaxed text-white/70">
        <div className="mb-2 uppercase tracking-widest text-fuchsia-300">&lt;head&gt; · hreflang alternates</div>
        {LOCALES.map((x) => (
          <div key={x.code}>
            &lt;link rel=<span className="text-emerald-300">"alternate"</span> hreflang=
            <span className="text-amber-300">"{x.hreflang}"</span> href=
            <span className="text-amber-300">"{x.url}"</span> /&gt;
          </div>
        ))}
        <div>
          &lt;link rel=<span className="text-emerald-300">"alternate"</span> hreflang=
          <span className="text-amber-300">"x-default"</span> href=
          <span className="text-amber-300">"/en/work"</span> /&gt;
        </div>
      </div>
    </div>
  );
}