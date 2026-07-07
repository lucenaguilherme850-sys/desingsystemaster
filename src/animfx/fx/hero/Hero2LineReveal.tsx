import { useEffect, useState } from "react";

export default function Hero2LineReveal() {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 80); return () => clearTimeout(t); }, []);
  const lines = ["We craft", "digital rituals", "that outlast the trend."];
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-[#0f0518]">
      <div className="mx-auto grid min-h-[80vh] max-w-6xl place-items-center px-6">
        <div>
          {lines.map((l, i) => (
            <div key={i} className="overflow-hidden">
              <div className="text-6xl md:text-8xl font-black uppercase leading-[0.95] text-white will-change-transform"
                   style={{ transform: `translateY(${go ? 0 : 110}%)`, transition: `transform 1.1s cubic-bezier(.2,.9,.2,1) ${i * 160}ms` }}>
                {l}
              </div>
            </div>
          ))}
          <div className="mt-8 h-[2px] w-0 bg-[#ff00c8]"
               style={{ width: go ? "180px" : 0, transition: "width 1.2s ease .6s" }} />
        </div>
      </div>
    </section>
  );
}