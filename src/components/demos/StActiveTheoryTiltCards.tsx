import { useRef } from "react";
import { IG } from "./_ig-tokens";

const CARDS = [
  { t: "01 / SIGNAL", s: "Real-time WebGL", h: "#FF5B1F" },
  { t: "02 / NEBULA", s: "Volumetric fog", h: "#7C5CFF" },
  { t: "03 / CIRCUIT", s: "Interactive OOH", h: "#22D3EE" },
];

export function StActiveTheoryTiltCards() {
  return (
    <div
      className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-md p-10"
      style={{ background: IG.bg, perspective: "1400px" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,91,31,0.25), transparent 60%)",
      }} />
      <div className="flex flex-wrap items-center justify-center gap-6" style={{ transformStyle: "preserve-3d" }}>
        {CARDS.map((c, i) => (
          <Card key={i} card={c} />
        ))}
      </div>
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: IG.inkFaint }}>
        Active Theory · tilt / parallax
      </div>
    </div>
  );
}

function Card({ card }: { card: { t: string; s: string; h: string } }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${px * 22}deg) rotateX(${-py * 22}deg) translateZ(30px)`;
    el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "rotateY(0) rotateX(0) translateZ(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative h-[240px] w-[180px] rounded-xl border p-5 transition-transform duration-300 ease-out will-change-transform"
      style={{
        borderColor: IG.rule,
        background: `radial-gradient(circle at var(--gx,50%) var(--gy,50%), ${card.h}33, ${IG.bgSoft} 55%)`,
        color: IG.ink,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: card.h }}>{card.t}</div>
      <div className="absolute inset-x-5 bottom-5">
        <div className="text-sm font-semibold leading-tight">{card.s}</div>
        <div className="mt-2 h-px w-8" style={{ background: card.h }} />
      </div>
    </div>
  );
}