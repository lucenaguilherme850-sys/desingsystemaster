import { useEffect, useState } from "react";

export default function Hero11WordSwap() {
  const words = ["brands", "products", "systems", "worlds"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#0a0518] px-6">
      <div className="text-center">
        <div className="text-4xl md:text-6xl font-black uppercase text-white/60">We build</div>
        <div className="relative mt-2 h-[1.1em] overflow-hidden text-6xl md:text-8xl font-black uppercase leading-none">
          {words.map((w, k) => (
            <div key={w} className="absolute inset-0 flex items-center justify-center will-change-transform"
                 style={{ transform: `translateY(${(k - i) * 100}%)`, transition: "transform .7s cubic-bezier(.2,.9,.2,1)", color: ["#00e5ff","#ff00c8","#a4ff00","#ffcc00"][k] }}>
              {w}
            </div>
          ))}
        </div>
        <div className="mt-2 text-4xl md:text-6xl font-black uppercase text-white/60">that move.</div>
      </div>
    </section>
  );
}