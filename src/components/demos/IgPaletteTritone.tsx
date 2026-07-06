const TONES = [
  { name: "void", hex: "#0A0A0F", role: "background" },
  { name: "bone", hex: "#F5F1E8", role: "foreground" },
  { name: "flux", hex: "#3B6EF5", role: "accent" },
];
export function IgPaletteTritone() {
  return (
    <div className="grid h-[320px] w-full grid-cols-3 overflow-hidden rounded-md border border-border">
      {TONES.map((t) => (
        <div key={t.name} className="relative flex flex-col justify-end p-4" style={{ background: t.hex }}>
          <div
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: t.name === "bone" ? "#0A0A0F" : "#F5F1E8" }}
          >
            {t.role}
          </div>
          <div
            className="font-mono text-2xl"
            style={{ color: t.name === "bone" ? "#0A0A0F" : "#F5F1E8" }}
          >
            {t.name}
          </div>
          <div
            className="font-mono text-[10px] uppercase"
            style={{ color: t.name === "bone" ? "#0A0A0F80" : "#F5F1E880" }}
          >
            {t.hex}
          </div>
        </div>
      ))}
    </div>
  );
}