import { useEffect, useRef } from "react";
import { palette } from "./palette";

export default function BgVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 4;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <Noise c1={c1} bg={bg} />;
  if (kind === 1) return <Aurora c1={c1} c2={c2} bg={bg} />;
  if (kind === 2) return <DotsGrid c1={c1} bg={bg} />;
  return <MeshBlobs c1={c1} c2={c2} bg={bg} />;
}

function Noise({ bg }: { c1: string; bg: string }) {
  const c = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = c.current!; const ctx = cv.getContext("2d")!;
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    let raf = 0;
    const loop = () => {
      const img = ctx.createImageData(cv.width, cv.height); const d = img.data;
      for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 40) | 0; d[i] = v; d[i + 1] = v; d[i + 2] = v + 20; d[i + 3] = 40; }
      ctx.putImageData(img, 0, 0); raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <canvas ref={c} className="absolute inset-0 h-full w-full mix-blend-overlay" />
      <h2 className="relative text-6xl md:text-8xl font-black uppercase text-white">grain</h2>
    </div>
  );
}

function Aurora({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="absolute h-[60vh] w-[80vw] opacity-40 blur-3xl" style={{ background: `linear-gradient(${45 + i * 60}deg, ${c1}, ${c2}, transparent)`, animation: `au ${15 + i * 3}s ease-in-out infinite`, animationDelay: `${i * 2}s`, transformOrigin: "center" }} />
      ))}
      <h2 className="relative text-6xl md:text-8xl font-black uppercase text-white">aurora</h2>
      <style>{`@keyframes au{50%{transform:translate(-10%,10%) rotate(20deg)}}`}</style>
    </div>
  );
}

function DotsGrid({ c1, bg }: { c1: string; bg: string }) {
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg, backgroundImage: `radial-gradient(${c1}55 1.5px, transparent 1.5px)`, backgroundSize: "24px 24px" }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, transparent, ${bg} 70%)` }} />
      <h2 className="relative text-6xl md:text-8xl font-black uppercase text-white">grid</h2>
    </div>
  );
}

function MeshBlobs({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div className="absolute -left-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full opacity-60 blur-3xl" style={{ background: c1, animation: "mba 14s ease-in-out infinite" }} />
      <div className="absolute right-0 top-0 h-[50vh] w-[50vh] rounded-full opacity-50 blur-3xl" style={{ background: c2, animation: "mbb 18s ease-in-out infinite" }} />
      <h2 className="relative text-6xl md:text-8xl font-black uppercase text-white">mesh</h2>
      <style>{`@keyframes mba{50%{transform:translate(30vw,-10vh)}}@keyframes mbb{50%{transform:translate(-25vw,25vh)}}`}</style>
    </div>
  );
}