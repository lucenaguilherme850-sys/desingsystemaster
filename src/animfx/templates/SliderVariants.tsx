import useEmblaCarousel from "embla-carousel-react";
import { useState } from "react";
import { palette } from "./palette";

export default function SliderVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 4;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <Drag c1={c1} c2={c2} bg={bg} />;
  if (kind === 1) return <Stack c1={c1} c2={c2} bg={bg} />;
  if (kind === 2) return <Marquee c1={c1} c2={c2} bg={bg} />;
  return <Snap c1={c1} c2={c2} bg={bg} />;
}

const TITLES = ["Nebula", "Kinetic", "Prism", "Aurora", "Vertex", "Pulse", "Echo", "Nova"];

function Drag({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [ref] = useEmblaCarousel({ dragFree: true, loop: true });
  return (
    <div style={{ background: bg }} className="min-h-[70vh] py-16">
      <div ref={ref} className="overflow-hidden">
        <div className="flex gap-6 pl-[10vw]">
          {TITLES.map((t, i) => (
            <div key={t} className="flex h-96 w-72 shrink-0 flex-col justify-between rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${i % 2 ? c1 : c2}, ${bg})`, border: `1px solid ${c1}44` }}>
              <div className="font-mono text-xs uppercase text-white/60">{String(i + 1).padStart(2, "0")}</div>
              <div className="text-3xl font-black uppercase text-white">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stack({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="grid min-h-[70vh] place-items-center" style={{ background: bg }}>
      <div className="relative h-96 w-72" onClick={() => setI((v) => (v + 1) % TITLES.length)}>
        {TITLES.map((t, idx) => {
          const off = (idx - i + TITLES.length) % TITLES.length;
          return (
            <div key={t} className="absolute inset-0 cursor-pointer rounded-2xl p-6 shadow-2xl transition-all duration-500"
                 style={{ background: `linear-gradient(135deg, ${idx % 2 ? c1 : c2}, ${bg})`, transform: `translate(${off * 12}px, ${off * -12}px) rotate(${off * 2}deg) scale(${1 - off * 0.05})`, zIndex: TITLES.length - off, opacity: off > 3 ? 0 : 1 }}>
              <div className="font-mono text-xs text-white/70">#{idx + 1}</div>
              <div className="mt-8 text-5xl font-black uppercase text-white">{t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Marquee({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const items = [...TITLES, ...TITLES];
  return (
    <div className="grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div className="w-full space-y-6">
        {[0, 1].map((r) => (
          <div key={r} className="flex whitespace-nowrap" style={{ animation: `mq ${28 + r * 6}s linear infinite`, animationDirection: r ? "reverse" : "normal" }}>
            {items.map((t, i) => (
              <span key={i} className="mx-4 inline-block rounded-full border px-6 py-3 text-lg font-black uppercase text-white" style={{ borderColor: (r + i) % 2 ? c1 : c2 }}>{t}</span>
            ))}
          </div>
        ))}
      </div>
      <style>{`@keyframes mq{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

function Snap({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [ref] = useEmblaCarousel({ align: "center" });
  return (
    <div style={{ background: bg }} className="min-h-[70vh] py-16">
      <div ref={ref} className="overflow-hidden">
        <div className="flex gap-4">
          {TITLES.map((t, i) => (
            <div key={t} className="grid h-[60vh] w-[60vw] max-w-lg shrink-0 place-items-center rounded-3xl" style={{ background: `linear-gradient(45deg, ${c1}, ${c2})`, opacity: 0.85 + (i % 2) * 0.15 }}>
              <div className="text-6xl font-black uppercase text-white mix-blend-overlay">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}