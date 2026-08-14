import { usePreviewQuality, PreviewQualityOptions, type PreviewQuality } from "@/hooks/use-preview-quality";

export function PreviewQualityPicker({ className = "" }: { className?: string }) {
  const { quality, config, setQuality } = usePreviewQuality();
  return (
    <div className={"rounded-2xl border border-border bg-card/30 p-5 " + className}>
      <div className="mb-4 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
        <span>Preview Engine</span>
        <span className="text-neon">{config.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PreviewQualityOptions().map((o) => {
          const active = quality === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setQuality(o.value as PreviewQuality)}
              className={
                "rounded-xl border px-3 py-2 text-[10px] font-black tracking-tight transition-all " +
                (active
                  ? "border-neon bg-neon text-background shadow-neon"
                  : "border-border bg-background/20 text-muted-foreground hover:border-neon/30 hover:text-foreground")
              }
            >
              {o.label.toUpperCase()}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[9px] font-medium leading-relaxed text-muted-foreground/60">
        Controla o carregamento adaptativo, autoplay e economia de dados.
      </p>
    </div>
  );
}