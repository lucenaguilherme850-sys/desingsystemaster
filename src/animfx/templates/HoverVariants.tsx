import { useRef, useState } from "react";
import { palette } from "./palette";

const IMGS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=70",
  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=70",
  "https://images.unsplash.com/photo-1618228851290-8d19985d92be?w=800&q=70",
  "https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&q=70",
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=70",
  "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&q=70",
];

export default function HoverVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 4;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <ImageReveal c1={c1} bg={bg} />;
  if (kind === 1) return <MagneticLinks c1={c1} c2={c2} bg={bg} />;
  if (kind === 2) return <MarqueeHover c1={c1} c2={c2} bg={bg} />;
  return <UnderlineSweep c1={c1} c2={c2} bg={bg} />;
}

function ImageReveal({ c1, bg }: { c1: string; bg: string }) {
  const [active, setActive] = useState<number | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = imgRef.current!;
    const r = el.parentElement!.getBoundingClientRect();
    el.style.transform = `translate3d(${e.clientX - r.left - 160}px, ${e.clientY - r.top - 120}px, 0)`;
  };
  const items = ["Kinetic", "Prism", "Aurora", "Vertex"];
  return (
    <div className="relative min-h-[70vh]" style={{ background: bg }} onMouseMove={onMove}>
      <div ref={imgRef} className="pointer-events-none absolute left-0 top-0 h-60 w-80 overflow-hidden rounded-lg transition-opacity" style={{ opacity: active !== null ? 1 : 0 }}>
        {items.map((_, i) => <img key={i} src={IMGS[i % IMGS.length]} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity" style={{ opacity: active === i ? 1 : 0 }} />)}
      </div>
      <ul className="mx-auto max-w-3xl px-6 py-24">
        {items.map((it, i) => (
          <li key={it} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              className="cursor-pointer border-b border-white/10 py-8 text-5xl md:text-7xl font-black uppercase text-white transition-colors"
              style={{ color: active === i ? c1 : "white" }}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function MagneticLinks({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center gap-6" style={{ background: bg }}>
      <div className="flex flex-wrap gap-6">
        {["Work", "About", "Store", "Blog"].map((w, i) => <Magnetic key={w} color={i % 2 ? c1 : c2}>{w}</Magnetic>)}
      </div>
    </div>
  );
}

function Magnetic({ children, color }: { children: string; color: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.45;
    const y = (e.clientY - r.top - r.height / 2) * 0.45;
    el.style.transform = `translate(${x}px,${y}px)`;
  };
  const reset = () => (ref.current!.style.transform = "");
  return (
    <button ref={ref} onMouseMove={move} onMouseLeave={reset}
            className="rounded-full border-2 px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors"
            style={{ borderColor: color, color }}>{children}</button>
  );
}

function MarqueeHover({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
           className="relative w-full cursor-pointer overflow-hidden border-y border-white/10 py-8">
        <div className="flex whitespace-nowrap" style={{ animation: `mh 20s linear infinite`, animationPlayState: hover ? "running" : "paused" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="mx-8 text-6xl md:text-8xl font-black uppercase" style={{ color: i % 2 ? c1 : c2 }}>Hover Me →</span>
          ))}
        </div>
        <style>{`@keyframes mh{to{transform:translateX(-50%)}}`}</style>
      </div>
    </div>
  );
}

function UnderlineSweep({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center" style={{ background: bg }}>
      <ul className="space-y-4">
        {["Discover", "Design", "Deliver", "Deploy"].map((w, i) => (
          <li key={w} className="group relative w-max cursor-pointer text-5xl md:text-7xl font-black uppercase text-white">
            {w}
            <span className="absolute -bottom-1 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full" style={{ background: i % 2 ? c1 : c2 }} />
          </li>
        ))}
      </ul>
    </div>
  );
}