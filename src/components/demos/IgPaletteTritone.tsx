const TONES = [
  { name: "void", hex: "#0A0A0A", role: "canvas", oklch: "10% 0.00 0", ink: "#F5F0E8" },
  { name: "bone", hex: "#F5F0E8", role: "surface", oklch: "95% 0.02 80", ink: "#0A0A0A" },
  { name: "ember", hex: "#FF5B1F", role: "accent · signal", oklch: "68% 0.20 40", ink: "#0A0A0A" },
];
export function IgPaletteTritone() {
  return (
    <div className="grid h-[320px] w-full grid-cols-3 overflow-hidden rounded-md border border-border">
      {TONES.map((t, i) => (
        <div
          key={t.name}
          className="group relative flex flex-col justify-between overflow-hidden p-5 transition-all"
          style={{ background: t.hex, color: t.ink }}
        >
          <div className="flex items-start justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
              {String(i + 1).padStart(2, "0")} · {t.role}
            </div>
            <div
              className="h-6 w-6 rounded-full ring-1 ring-black/10"
              style={{ background: t.ink, opacity: 0.9 }}
            />
          </div>
          <div>
            <div className="font-serif text-5xl italic leading-none">{t.name}</div>
            <div className="mt-3 space-y-0.5 font-mono text-[10px] uppercase opacity-70">
              <div>hex {t.hex}</div>
              <div>oklch {t.oklch}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}