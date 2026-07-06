import { IG } from "./_ig-tokens";

export function IgTextBlock() {
  return (
    <div
      className="relative grid h-[360px] w-full grid-cols-12 gap-4 overflow-hidden rounded-md border p-10"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="col-span-2 space-y-2 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        <div style={{ color: IG.accent }}>§ 07</div>
        <div>manifesto</div>
      </div>
      <div className="relative z-10 col-span-8 col-start-4 space-y-5">
        <p className="font-serif text-2xl italic leading-snug" style={{ color: IG.ink }}>
          We craft <span style={{ color: IG.accent }}>immersive digital experiences</span> where
          motion, sound and interaction converge into a single narrative gesture.
        </p>
        <p
          className="max-w-[45ch] text-sm leading-relaxed"
          style={{ color: IG.inkMuted }}
        >
          Every project begins with a question, ends with a system, and lives somewhere in between
          as a small, precise piece of weather.
        </p>
        <div
          className="flex items-center gap-4 pt-2 font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: IG.inkFaint }}
        >
          <span>— editorial voice</span>
          <span className="h-px flex-1" style={{ background: IG.rule }} />
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}