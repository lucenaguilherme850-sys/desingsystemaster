const cells = [
  { w: 6, pos: 2, tone: "bg-neon/20" },
  { w: 4, pos: 8, tone: "bg-foreground/10" },
  { w: 3, pos: 3, tone: "bg-foreground/15" },
  { w: 5, pos: 7, tone: "bg-neon/30" },
  { w: 8, pos: 2, tone: "bg-foreground/10" },
  { w: 4, pos: 1, tone: "bg-neon/25" },
];

export function IgGridSlots() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2 rounded-md border border-border bg-card p-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="col-span-1 h-6 rounded-sm border border-dashed border-border/60 text-center font-mono text-[10px] leading-6 text-muted-foreground"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <div className="grid grid-cols-12 gap-2">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`${c.tone} flex h-24 items-end justify-between rounded-sm p-2 font-mono text-[10px] text-foreground/70`}
              style={{ gridColumnStart: c.pos, gridColumnEnd: `span ${c.w}` }}
            >
              <span>width__{c.w}</span>
              <span>position__{c.pos}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">
        cada bloco declara <code className="text-foreground">width__N</code> +{" "}
        <code className="text-foreground">position__N</code> sobre grid de 12 colunas.
      </p>
    </div>
  );
}