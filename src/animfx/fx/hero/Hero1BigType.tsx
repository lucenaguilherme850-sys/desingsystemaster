import { useEffect, useState } from "react";

export default function Hero1BigType() {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  const words = ["MOTION", "DESIGN", "SYSTEM"];
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#050914] px-6">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 60% at 50% 30%, #00e5ff22, transparent 70%)" }} />
      <div className="relative text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#00e5ff]" style={{ opacity: go ? 1 : 0, transform: `translateY(${go ? 0 : 20}px)`, transition: "all .8s ease" }}>the studio</div>
        {words.map((w, i) => (
          <div key={w} className="text-[16vw] font-black uppercase leading-[0.85] text-white will-change-transform"
               style={{ opacity: go ? 1 : 0, transform: `translateY(${go ? 0 : 80}px)`, transition: `all 1s cubic-bezier(.2,.9,.2,1) ${120 + i * 180}ms` }}>
            {w}
          </div>
        ))}
      </div>
    </section>
  );
}