import { IG } from "./_ig-tokens";

const PROJECTS = [
  { title: "Atlas Cartography", client: "Studio Nord", year: "2024", tags: ["WebGL", "Editorial"] },
  { title: "Helix Perfume", client: "Prism & Co.", year: "2024", tags: ["Brand", "3D"] },
  { title: "Vertex Records", client: "Neon Foundry", year: "2023", tags: ["Motion", "Audio"] },
  { title: "Quanta Museum", client: "Fond. Lumière", year: "2023", tags: ["Immersive"] },
];

export function IgProjectBlock() {
  return (
    <div
      className="h-[400px] w-full space-y-3 overflow-auto rounded-md border p-4"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        <span>Selected work — 2023 / 2024</span>
        <span>04</span>
      </div>
      {PROJECTS.map((p, i) => (
        <a
          key={p.title}
          href="#"
          className="group relative flex items-center gap-5 overflow-hidden rounded-sm border p-4"
          style={{
            borderColor: IG.rule,
            background: IG.surface,
            transition: `background 700ms ${IG.ease}, border-color 700ms ${IG.ease}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(245,240,232,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = IG.rule;
          }}
        >
          <div
            className="relative flex h-20 w-32 shrink-0 items-end justify-start overflow-hidden rounded-sm p-2"
            style={{
              background: `linear-gradient(135deg, rgba(245,240,232,0.12), rgba(245,240,232,0.02))`,
            }}
          >
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: IG.inkMuted }}
            >
              № {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="flex-1">
            <div
              className="font-serif text-2xl italic"
              style={{
                color: IG.ink,
                transition: `transform 700ms ${IG.ease}, color 700ms ${IG.ease}`,
              }}
            >
              <span className="ig-title inline-block">{p.title}</span>
            </div>
            <div
              className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: IG.inkFaint }}
            >
              <span>{p.client}</span>
              <span>·</span>
              <span>{p.year}</span>
              <span>·</span>
              <span className="flex gap-1">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border px-2 py-0.5"
                    style={{ borderColor: IG.rule, color: IG.inkMuted }}
                  >
                    {t}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: IG.accent, transition: `transform 700ms ${IG.ease}` }}
          >
            case →
          </span>
        </a>
      ))}
      <style>{`
        a.group:hover .ig-title { transform: translateX(6px); color: ${IG.accent}; }
        a.group:hover span[style*="${IG.accent}"] { transform: translateX(4px); }
      `}</style>
    </div>
  );
}