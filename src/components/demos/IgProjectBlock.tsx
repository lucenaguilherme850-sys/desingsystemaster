const PROJECTS = [
  { title: "Atlas", client: "Studio Nord", year: "2024", hue: 220 },
  { title: "Helix", client: "Prism Labs", year: "2024", hue: 320 },
  { title: "Vertex", client: "Neon Foundry", year: "2023", hue: 40 },
];
export function IgProjectBlock() {
  return (
    <div className="h-[400px] w-full space-y-3 overflow-auto rounded-md border border-border bg-background p-4">
      {PROJECTS.map((p) => (
        <a
          key={p.title}
          href="#"
          className="group relative flex items-center gap-4 overflow-hidden rounded border border-border bg-card p-4 transition-colors hover:bg-card/60"
        >
          <div
            className="h-20 w-32 shrink-0 rounded"
            style={{ background: `linear-gradient(135deg, hsl(${p.hue} 70% 20%), hsl(${(p.hue + 60) % 360} 80% 50%))` }}
          />
          <div className="flex-1">
            <div className="font-mono text-2xl text-foreground transition-transform duration-500 group-hover:translate-x-1">
              {p.title}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {p.client} · {p.year}
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground transition-transform duration-500 group-hover:translate-x-1">
            view →
          </span>
        </a>
      ))}
    </div>
  );
}