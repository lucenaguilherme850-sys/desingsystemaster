import { useEffect, useState } from "react";

const line1 = "300 PRO";
const line2 = "COMPONENTS";

export default function HeroSplit() {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  const render = (text: string, base: number) => text.split("").map((ch, i) => (
    <span key={i} className="inline-block overflow-hidden align-bottom">
      <span
        className="inline-block will-change-transform"
        style={{
          transform: go ? "translateY(0)" : "translateY(110%)",
          transition: `transform .9s cubic-bezier(.2,.8,.2,1) ${base + i * 45}ms`,
        }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    </span>
  ));
  return (
    <div className="grid min-h-[80vh] place-items-center bg-[#07090f] px-6">
      <div>
        <div
          className="font-mono text-xs uppercase tracking-[0.4em] text-neon opacity-0"
          style={{ opacity: go ? 1 : 0, transition: "opacity .6s ease .2s" }}
        >
          hero split reveal
        </div>
        <h1 className="mt-3 text-6xl md:text-9xl font-black uppercase leading-[0.9]">
          <div>{render(line1, 100)}</div>
          <div className="text-neon">{render(line2, 300)}</div>
        </h1>
      </div>
    </div>
  );
}