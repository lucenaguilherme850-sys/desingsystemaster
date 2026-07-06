export function IgSsrPayloadPreload() {
  const steps = [
    { t: "0ms", label: "HTML shipped with __NUXT__ payload", color: "bg-primary" },
    { t: "50ms", label: "Fonts preloaded via <link rel=preload>", color: "bg-primary" },
    { t: "120ms", label: "Hero image LCP paint", color: "bg-primary/70" },
    { t: "400ms", label: "JS hydrates, reuses payload — no refetch", color: "bg-primary/50" },
    { t: "600ms", label: "WebGL + Lenis boot", color: "bg-primary/30" },
  ];
  return (
    <div className="h-[340px] w-full space-y-3 rounded-md border border-border bg-background p-6 font-mono">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">ssr payload · preload chain</div>
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-14 text-[10px] uppercase text-muted-foreground">{s.t}</span>
          <span className={`h-2 w-2 rounded-full ${s.color}`} />
          <span className="flex-1 text-xs text-foreground">{s.label}</span>
        </div>
      ))}
      <div className="mt-4 rounded border border-border bg-card p-3 text-[10px] text-muted-foreground">
        payload = JSON serializado do estado SSR → hidratação sem waterfall de fetches.
      </div>
    </div>
  );
}