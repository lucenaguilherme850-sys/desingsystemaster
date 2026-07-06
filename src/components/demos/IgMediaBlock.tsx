export function IgMediaBlock() {
  return (
    <div className="grid h-[360px] w-full grid-cols-12 grid-rows-6 gap-2 rounded-md border border-border bg-background p-3">
      <div
        className="relative overflow-hidden rounded border border-border"
        style={{ gridColumn: "2 / span 5", gridRow: "1 / span 4", background: "linear-gradient(135deg,#0f172a,#1e40af)" }}
      >
        <span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase text-white/80">media · 5/4</span>
      </div>
      <div
        className="relative overflow-hidden rounded border border-border"
        style={{ gridColumn: "8 / span 4", gridRow: "2 / span 3", background: "linear-gradient(135deg,#4c0519,#e11d48)" }}
      >
        <span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase text-white/80">media · 4/3</span>
      </div>
      <div
        className="relative overflow-hidden rounded border border-border"
        style={{ gridColumn: "3 / span 3", gridRow: "5 / span 2", background: "linear-gradient(135deg,#022c22,#10b981)" }}
      >
        <span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase text-white/80">media · 3/2</span>
      </div>
      <div
        className="relative overflow-hidden rounded border border-border"
        style={{ gridColumn: "7 / span 5", gridRow: "5 / span 2", background: "linear-gradient(135deg,#1c1917,#a78bfa)" }}
      >
        <span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase text-white/80">media · 5/2</span>
      </div>
    </div>
  );
}