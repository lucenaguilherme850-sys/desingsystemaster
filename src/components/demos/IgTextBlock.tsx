export function IgTextBlock() {
  return (
    <div className="relative grid h-[360px] w-full grid-cols-12 gap-4 overflow-hidden rounded-md border border-border bg-gradient-to-br from-[#0a0f1e] via-[#050510] to-[#1a0a1f] p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="col-span-2 space-y-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/70">
        <div>§ 07</div>
        <div className="text-white/40">manifesto</div>
      </div>
      <div className="relative z-10 col-span-8 col-start-4 space-y-5">
        <p className="font-serif text-2xl italic leading-snug text-white">
          We craft{" "}
          <span className="rounded-sm bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent not-italic">
            immersive digital experiences
          </span>{" "}
          where motion, sound and interaction converge into a single narrative gesture.
        </p>
        <p className="max-w-[45ch] font-sans text-sm leading-relaxed text-white/60">
          Every project begins with a question, ends with a system, and lives somewhere in
          between as a small, precise piece of weather.
        </p>
        <div className="flex items-center gap-4 pt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <span>— editorial voice</span>
          <span className="h-px flex-1 bg-white/10" />
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}