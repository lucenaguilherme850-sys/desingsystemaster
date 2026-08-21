import { useEffect, useRef, useState } from "react";
import { palette } from "./palette";

const WORDS = ["ANIMATED", "MOTION LIB", "SHIP FAST", "KINETIC", "PRISM", "AURORA"];

export default function TextVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 4;
  const [c1, c2, bg] = palette(seed);
  const w = WORDS[seed % WORDS.length];
  if (kind === 0) return <Scramble c1={c1} bg={bg} />;
  if (kind === 1) return <SplitLines c1={c1} c2={c2} bg={bg} word={w} />;
  if (kind === 2) return <WaveChars c1={c1} bg={bg} word={w} />;
  return <BlurIn c1={c1} c2={c2} bg={bg} word={w} />;
}

const CHARS = "!<>-_\\/[]{}—=+*^?#________";
function Scramble({ c1, bg }: { c1: string; bg: string }) {
  const [html, setHtml] = useState(WORDS[0]);
  const iRef = useRef(0);
  useEffect(() => {
    let stop = false;
    const scramble = (target: string, done: () => void) => {
      const queue = target.split("").map(() => ({ start: (Math.random() * 20) | 0, end: ((Math.random() * 20) | 0) + 20, char: "" }));
      let f = 0;
      const tick = () => {
        if (stop) return;
        let out = ""; let cpl = 0;
        target.split("").forEach((t, i) => {
          const q = queue[i];
          if (f >= q.end) { cpl++; out += t; }
          else if (f >= q.start) { if (!q.char || Math.random() < 0.28) q.char = CHARS[(Math.random() * CHARS.length) | 0]; out += `<span style="color:${c1}">${q.char}</span>`; }
          else out += " ";
        });
        setHtml(out);
        if (cpl === target.length) { done(); return; }
        f++; requestAnimationFrame(tick);
      };
      tick();
    };
    const cycle = () => { if (stop) return; iRef.current = (iRef.current + 1) % WORDS.length; scramble(WORDS[iRef.current], () => setTimeout(cycle, 1500)); };
    const t = setTimeout(cycle, 400);
    return () => { stop = true; clearTimeout(t); };
  }, [c1]);
  return <div className="grid min-h-[60vh] place-items-center" style={{ background: bg }}><div className="font-mono text-5xl md:text-7xl font-black uppercase text-white" dangerouslySetInnerHTML={{ __html: html }} /></div>;
}

function SplitLines({ c1, c2, bg, word }: { c1: string; c2: string; bg: string; word: string }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div className="grid min-h-[60vh] place-items-center px-6" style={{ background: bg }}>
      <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.9]">
        {word.split("").map((ch, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span className="inline-block" style={{ color: i % 2 ? c1 : c2, transform: go ? "translateY(0)" : "translateY(110%)", transition: `transform .9s cubic-bezier(.2,.8,.2,1) ${i * 55}ms` }}>{ch === " " ? "\u00A0" : ch}</span>
          </span>
        ))}
      </h2>
    </div>
  );
}

function WaveChars({ c1, bg, word }: { c1: string; bg: string; word: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center" style={{ background: bg }}>
      <h2 className="text-6xl md:text-8xl font-black uppercase text-white">
        {word.split("").map((ch, i) => (
          <span key={i} className="inline-block" style={{ animation: `wv 1.6s ${i * 0.08}s ease-in-out infinite`, color: i % 2 ? c1 : "white" }}>{ch === " " ? "\u00A0" : ch}</span>
        ))}
      </h2>
      <style>{`@keyframes wv{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}`}</style>
    </div>
  );
}

function BlurIn({ c1, c2, bg, word }: { c1: string; c2: string; bg: string; word: string }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div className="grid min-h-[60vh] place-items-center" style={{ background: bg }}>
      <h2 className="text-6xl md:text-8xl font-black uppercase" style={{ color: "white" }}>
        {word.split("").map((ch, i) => (
          <span key={i} className="inline-block" style={{ color: i % 2 ? c1 : c2, filter: go ? "blur(0)" : "blur(24px)", opacity: go ? 1 : 0, transition: `all .8s ${i * 60}ms` }}>{ch === " " ? "\u00A0" : ch}</span>
        ))}
      </h2>
    </div>
  );
}