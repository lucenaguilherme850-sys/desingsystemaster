import { useEffect, useState } from "react";

const CHARS = "!@#$%&*_+-=?/\\<>ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function scramble(target: string, progress: number): string {
  const len = target.length;
  const revealed = Math.floor(progress * len);
  let out = "";
  for (let i = 0; i < len; i++) {
    if (i < revealed) out += target[i];
    else if (target[i] === " ") out += " ";
    else out += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return out;
}

export default function Hero3ScrambleCta() {
  const target = "BUILD FASTER";
  const [txt, setTxt] = useState(scramble(target, 0));
  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += 0.05;
      setTxt(scramble(target, Math.min(1, p)));
      if (p >= 1.4) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 40% at 50% 50%, #a4ff0022, transparent 70%)" }} />
      <div className="relative text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-[#a4ff00]">v1.0 · out now</div>
        <h1 className="mt-4 font-mono text-6xl md:text-8xl font-black tracking-tight text-white">{txt}</h1>
        <button className="mt-8 rounded-full border-2 border-[#a4ff00] px-8 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#a4ff00] transition-all hover:bg-[#a4ff00] hover:text-black">
          get started →
        </button>
      </div>
    </section>
  );
}