const PROJECTS = [
  { title: "Atlas Cartography", client: "Studio Nord", year: "2024", tags: ["WebGL", "Editorial"], bg: "radial-gradient(circle at 20% 30%, #22d3ee, #0e7490 60%, #0c4a6e)" },
  { title: "Helix Perfume", client: "Prism & Co.", year: "2024", tags: ["Brand", "3D"], bg: "conic-gradient(from 200deg, #f472b6, #a855f7, #22d3ee, #f472b6)" },
  { title: "Vertex Records", client: "Neon Foundry", year: "2023", tags: ["Motion", "Audio"], bg: "linear-gradient(135deg, #fb7185, #f97316, #facc15)" },
  { title: "Quanta Museum", client: "Fond. Lumière", year: "2023", tags: ["Immersive"], bg: "linear-gradient(135deg, #052e16, #10b981, #a7f3d0)" },
];
export function IgProjectBlock() {
  return (
    <div className="h-[400px] w-full space-y-3 overflow-auto rounded-md border border-border bg-[#050510] p-4">
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        <span>selected work · 2023—2024</span>
        <span>04</span>
      </div>
      {PROJECTS.map((p, i) => (
        <a
          key={p.title}
          href="#"
          className="group relative flex items-center gap-4 overflow-hidden rounded border border-white/10 bg-white/[0.02] p-4 transition-all duration-500 hover:border-white/30 hover:bg-white/[0.05]"
        >
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded" style={{ background: p.bg }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-1 left-2 font-mono text-[9px] uppercase tracking-widest text-white/80">
              n° {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-serif text-2xl italic text-white transition-transform duration-500 group-hover:translate-x-1">
              {p.title}
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span>{p.client}</span>
              <span>·</span>
              <span>{p.year}</span>
              <span>·</span>
              <span className="flex gap-1">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/15 px-2 py-0.5 text-white/70">
                    {t}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white">
            case →
          </span>
        </a>
      ))}
    </div>
  );
}