import { usePreviewQuality, PreviewQualityOptions, type PreviewQuality } from "@/hooks/use-preview-quality";

export function PreviewQualityPicker({ className = "" }: { className?: string }) {
  const { quality, config, setQuality } = usePreviewQuality();
  return (
    <div className={"rounded-lg border border-border/60 bg-card/40 p-3 " + className}>
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>qualidade da prévia</span>
        <span className="text-neon">{config.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {PreviewQualityOptions().map((o) => {
          const active = quality === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setQuality(o.value as PreviewQuality)}
              className={
                "rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all " +
                (active
                  ? "border-neon bg-neon text-background"
                  : "border-border bg-background/40 text-muted-foreground hover:border-neon/50 hover:text-foreground")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] leading-tight text-muted-foreground/80">
        Ajusta autoplay, preload e concorrência para acelerar o carregamento em conexões lentas.
      </p>
    </div>
  );
}