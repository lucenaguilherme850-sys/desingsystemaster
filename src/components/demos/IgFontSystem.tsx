export function IgFontSystem() {
  return (
    <div className="h-[360px] w-full space-y-4 overflow-auto rounded-md border border-border bg-background p-6">
      {[
        { name: "display", size: "clamp(2.5rem, 6vw, 4.5rem)", family: "serif", label: "Display · Times variant" },
        { name: "title", size: "2rem", family: "sans-serif", label: "Title · Sans neue" },
        { name: "body", size: "1rem", family: "sans-serif", label: "Body · Sans neue 400" },
        { name: "mono", size: "0.75rem", family: "monospace", label: "MONO · UI · 10PX UPPERCASE" },
      ].map((f) => (
        <div key={f.name} className="flex items-baseline justify-between border-b border-border pb-3">
          <span style={{ fontFamily: f.family, fontSize: f.size }} className="text-foreground">
            Aa
          </span>
          <div className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <div>{f.label}</div>
            <div>{f.size}</div>
          </div>
        </div>
      ))}
    </div>
  );
}