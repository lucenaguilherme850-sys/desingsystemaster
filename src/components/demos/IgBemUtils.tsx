export function IgBemUtils() {
  return (
    <div className="h-[360px] w-full overflow-auto rounded-md border border-border bg-background p-6 font-mono text-xs">
      <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">bem + utility classes</div>
      <pre className="text-foreground/90">
{`<section class="hero hero--home">
  <div class="hero__inner width__6 offset__3">
    <h1 class="hero__title text__display">
      <span class="line__reveal">immersive garden</span>
    </h1>
    <p class="hero__lede text__body color__muted">
      studio of digital craft.
    </p>
  </div>
</section>`}
      </pre>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] uppercase">
        {["width__N", "offset__N", "gap__N", "text__display", "text__body", "color__muted"].map((c) => (
          <span key={c} className="rounded border border-border bg-card px-2 py-1 text-center text-foreground">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}