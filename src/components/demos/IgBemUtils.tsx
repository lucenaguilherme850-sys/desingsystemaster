const CODE = `<section class="hero hero--home">
  <div class="hero__inner width__6 offset__3">
    <h1 class="hero__title text__display">
      <span class="line__reveal">immersive garden</span>
    </h1>
    <p class="hero__lede text__body color__muted">
      studio of digital craft.
    </p>
  </div>
</section>`;

function tint(code: string) {
  return code
    .replace(/(&lt;|<)(\/?)([a-z0-9]+)/g, '<span style="color:#7dd3fc">$1$2$3</span>')
    .replace(/(class)=/g, '<span style="color:#f0abfc">$1</span>=')
    .replace(/"([^"]+)"/g, '"<span style="color:#fde68a">$1</span>"');
}

export function IgBemUtils() {
  return (
    <div className="h-[360px] w-full overflow-auto rounded-md border border-border bg-[#0b0d17] p-6 font-mono text-xs text-white/80">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
        <span>◆ bem + utility · declarative layout</span>
        <span className="text-emerald-400">index.html</span>
      </div>
      <pre className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: tint(CODE) }} />
      <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">tokens · width, offset, gap</div>
      <div className="grid grid-cols-3 gap-2 text-[10px] uppercase">
        {[
          { c: "width__N", d: "N/12 columns" },
          { c: "offset__N", d: "start col N" },
          { c: "gap__N", d: "N × baseline" },
          { c: "text__display", d: "T1 · serif" },
          { c: "text__body", d: "T3 · sans" },
          { c: "color__muted", d: "40% ink" },
        ].map((t) => (
          <span
            key={t.c}
            className="rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center text-white/80"
            title={t.d}
          >
            <span className="text-fuchsia-300">{t.c}</span>
            <br />
            <span className="text-[8px] text-white/40">{t.d}</span>
          </span>
        ))}
      </div>
    </div>
  );
}