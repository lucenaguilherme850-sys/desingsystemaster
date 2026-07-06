import { useState } from "react";
const LOCALES = [
  { code: "en", url: "/en/work", title: "Our Work — IG Studio", hreflang: "en" },
  { code: "fr", url: "/fr/travaux", title: "Nos travaux — IG Studio", hreflang: "fr" },
  { code: "ja", url: "/ja/works", title: "制作実績 — IG Studio", hreflang: "ja" },
];
export function IgI18nGoogleFriendly() {
  const [i, setI] = useState(0);
  const l = LOCALES[i];
  return (
    <div className="h-[360px] w-full space-y-3 rounded-md border border-border bg-background p-6 font-mono">
      <div className="flex items-center gap-2">
        {LOCALES.map((x, n) => (
          <button
            key={x.code}
            onClick={() => setI(n)}
            className={`rounded px-2 py-1 text-[10px] uppercase ${
              n === i ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {x.code}
          </button>
        ))}
      </div>
      <div className="rounded border border-border bg-card p-4 text-xs text-foreground">
        <div className="text-[10px] uppercase text-muted-foreground">url</div>
        <div className="text-base">{l.url}</div>
        <div className="mt-2 text-[10px] uppercase text-muted-foreground">&lt;title&gt;</div>
        <div>{l.title}</div>
      </div>
      <div className="rounded border border-border bg-card p-4 text-[10px] text-muted-foreground">
        <div className="mb-2 uppercase text-foreground">&lt;head&gt; hreflang</div>
        {LOCALES.map((x) => (
          <div key={x.code}>
            &lt;link rel="alternate" hreflang="{x.hreflang}" href="{x.url}" /&gt;
          </div>
        ))}
        <div>&lt;link rel="alternate" hreflang="x-default" href="/en/work" /&gt;</div>
      </div>
    </div>
  );
}