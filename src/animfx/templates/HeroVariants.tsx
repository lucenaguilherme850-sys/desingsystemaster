import { useEffect, useState } from "react";
import { palette } from "./palette";

export default function HeroVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 5;
  const [c1, c2, bg] = palette(seed);
  const words = ["MOTION", "KINETIC", "PULSE", "NOVA", "AURORA", "PRISM"];
  const w = words[seed % words.length];
  if (kind === 0) return <SplitReveal c1={c1} c2={c2} bg={bg} word={w} />;
  if (kind === 1) return <GradientMesh c1={c1} c2={c2} bg={bg} word={w} />;
  if (kind === 2) return <MarqueeHero c1={c1} c2={c2} bg={bg} word={w} />;
  if (kind === 3) return <GlitchTitle c1={c1} c2={c2} bg={bg} word={w} />;
  return <TypewriterHero c1={c1} c2={c2} bg={bg} word={w} />;
}

function SplitReveal({ c1, c2, bg, word }: { c1: string; c2: string; bg: string; word: string }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div className="grid min-h-[80vh] place-items-center px-6" style={{ background: bg }}>
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: c1, opacity: go ? 1 : 0, transition: "opacity .6s .2s" }}>hero split reveal</div>
        <h1 className="mt-3 text-6xl md:text-9xl font-black uppercase leading-[0.9]">
          {word.split("").map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span className="inline-block" style={{
                color: i % 2 ? c1 : "#fff",
                transform: go ? "translateY(0)" : "translateY(110%)",
                transition: `transform .9s cubic-bezier(.2,.8,.2,1) ${i * 60}ms`,
              }}>{ch}</span>
            </span>
          ))}
        </h1>
        <div className="mt-4 h-[3px] w-0" style={{ background: c2, width: go ? "12rem" : 0, transition: "width 1s .8s" }} />
      </div>
    </div>
  );
}

function GradientMesh({ c1, c2, bg, word }: { c1: string; c2: string; bg: string; word: string }) {
  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div className="absolute -left-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full opacity-60 blur-3xl" style={{ background: c1, animation: "meshA 14s ease-in-out infinite" }} />
      <div className="absolute right-0 top-0 h-[50vh] w-[50vh] rounded-full opacity-50 blur-3xl" style={{ background: c2, animation: "meshB 18s ease-in-out infinite" }} />
      <div className="relative z-10 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-white/70">gradient hero</div>
        <h1 className="mt-4 text-6xl md:text-8xl font-black uppercase text-white">{word}</h1>
      </div>
      <style>{`@keyframes meshA{50%{transform:translate(30vw,-10vh)}}@keyframes meshB{50%{transform:translate(-25vw,25vh)}}`}</style>
    </div>
  );
}

function MarqueeHero({ c1, c2, bg, word }: { c1: string; c2: string; bg: string; word: string }) {
  const row = Array.from({ length: 8 }).map((_, i) => (i % 2 ? "·" : word));
  return (
    <div className="grid min-h-[80vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <div className="w-full space-y-4">
        {[0, 1, 2].map((r) => (
          <div key={r} className="flex whitespace-nowrap" style={{ animation: `marq ${25 + r * 6}s linear infinite`, animationDirection: r % 2 ? "reverse" : "normal" }}>
            {[...row, ...row].map((w, i) => (
              <span key={i} className="mx-6 text-6xl md:text-8xl font-black uppercase" style={{ color: r === 1 ? c1 : (i % 2 ? c2 : "#fff") }}>{w}</span>
            ))}
          </div>
        ))}
      </div>
      <style>{`@keyframes marq{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

function GlitchTitle({ c1, c2, bg, word }: { c1: string; c2: string; bg: string; word: string }) {
  return (
    <div className="grid min-h-[80vh] place-items-center" style={{ background: bg }}>
      <div className="relative">
        <h1 className="text-7xl md:text-9xl font-black uppercase text-white">{word}</h1>
        <h1 className="absolute inset-0 text-7xl md:text-9xl font-black uppercase mix-blend-screen" style={{ color: c1, animation: "gl1 3s infinite" }}>{word}</h1>
        <h1 className="absolute inset-0 text-7xl md:text-9xl font-black uppercase mix-blend-screen" style={{ color: c2, animation: "gl2 3s infinite" }}>{word}</h1>
        <style>{`@keyframes gl1{0%,100%{transform:translate(0)}20%{transform:translate(-6px,2px)}40%{transform:translate(3px,-2px)}}@keyframes gl2{0%,100%{transform:translate(0)}30%{transform:translate(5px,3px)}60%{transform:translate(-4px,-3px)}}`}</style>
      </div>
    </div>
  );
}

function TypewriterHero({ c1, c2, bg, word }: { c1: string; c2: string; bg: string; word: string }) {
  const [t, setT] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { 
      if (document.hidden) return; // Don't run if tab is hidden
      i++; setT(word.slice(0, i)); 
      if (i >= word.length) { i = 0; setTimeout(() => setT(""), 1200); } 
    }, 140);
    return () => clearInterval(id);
  }, [word]);
  return (
    <div className="grid min-h-[80vh] place-items-center" style={{ background: bg }}>
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: c1 }}>typewriter</div>
        <h1 className="mt-3 font-mono text-6xl md:text-9xl font-black uppercase text-white">
          {t}<span className="inline-block h-[0.9em] w-[0.5em] translate-y-1" style={{ background: c2, animation: "blk 0.8s steps(2) infinite" }} />
        </h1>
        <style>{`@keyframes blk{50%{opacity:0}}`}</style>
      </div>
    </div>
  );
}