import { useRef } from "react";

function TiltCard({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 22}deg) rotateX(${-y * 22}deg) translateZ(0)`;
    (el.querySelector("[data-glow]") as HTMLElement).style.background = `radial-gradient(220px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, oklch(.82 .17 225 / .35), transparent 60%)`;
  };
  const reset = () => { ref.current!.style.transform = "perspective(900px)"; };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="relative h-72 w-56 rounded-2xl border border-border bg-gradient-to-br from-card to-background p-6 transition-transform will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div data-glow className="pointer-events-none absolute inset-0 rounded-2xl" />
      <div className="font-mono text-xs uppercase tracking-widest text-neon">3d tilt</div>
      <div className="mt-6 text-4xl font-black">{label}</div>
    </div>
  );
}

export default function CardTilt3D() {
  return (
    <div className="flex min-h-[60vh] flex-wrap items-center justify-center gap-6 bg-[#07090f] p-10">
      {["A", "B", "C"].map((l) => <TiltCard key={l} label={l} />)}
    </div>
  );
}