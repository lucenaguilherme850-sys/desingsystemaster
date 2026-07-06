import { IG } from "./_ig-tokens";

const SCALE = [
  { name: "display", size: "clamp(3rem, 6vw, 4.5rem)", family: "'Times New Roman', serif", italic: true, sample: "Immersive", label: "T1 · Editorial serif", weight: 400 },
  { name: "title", size: "2rem", family: "'Inter', sans-serif", italic: false, sample: "Selected work", label: "T2 · Sans display", weight: 600 },
  { name: "body", size: "1rem", family: "'Inter', sans-serif", italic: false, sample: "The studio builds digital experiences.", label: "T3 · Body sans", weight: 400 },
  { name: "mono", size: "0.7rem", family: "monospace", italic: false, sample: "— 001 · LOREM · IPSUM · 42FPS", label: "T4 · UI mono", weight: 400 },
];

export function IgFontSystem() {
  return (
    <div
      className="h-[360px] w-full space-y-5 overflow-auto rounded-md border p-6"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="flex items-baseline justify-between border-b pb-2 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ borderColor: IG.rule, color: IG.inkFaint }}
      >
        <span>Type — scale</span>
        <span>04 sizes · 3 families</span>
      </div>
      {SCALE.map((f) => (
        <div
          key={f.name}
          className="flex items-baseline justify-between gap-6 border-b pb-5"
          style={{ borderColor: IG.rule }}
        >
          <div
            className="flex-1"
            style={{
              fontFamily: f.family,
              fontSize: f.size,
              fontStyle: f.italic ? "italic" : "normal",
              fontWeight: f.weight,
              lineHeight: 1,
              color: IG.ink,
            }}
          >
            {f.sample}
          </div>
          <div
            className="w-40 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: IG.inkFaint }}
          >
            <div style={{ color: IG.accent }}>{f.label}</div>
            <div>{f.name}</div>
            <div>{f.size.replace("clamp(3rem, 6vw, 4.5rem)", "48—72px")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}