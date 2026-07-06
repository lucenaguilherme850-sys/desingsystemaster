export function IgTextBlock() {
  return (
    <div className="grid h-[360px] w-full grid-cols-12 gap-4 rounded-md border border-border bg-background p-6 font-mono">
      <div className="col-span-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        01 / manifesto
      </div>
      <div className="col-span-7 col-start-4 space-y-4">
        <p className="text-xl leading-snug text-foreground">
          We craft <span className="text-primary">immersive digital experiences</span> where
          motion, sound and interaction converge into a single narrative gesture.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Text blocks are constrained to a 6-column measure with a 3-column offset, using
          fluid typography tied to the viewport width.
        </p>
      </div>
    </div>
  );
}