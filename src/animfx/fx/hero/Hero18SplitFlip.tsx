import { useEffect, useState } from "react";

export default function Hero18SplitFlip() {
  const [split, setSplit] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSplit(true), 300); return () => clearTimeout(t); }, []);
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black">
      <div className="absolute inset-y-0 left-0 w-1/2 origin-right transition-transform duration-[1200ms] ease-[cubic-bezier(.7,0,.2,1)]"
           style={{ background: "linear-gradient(135deg, #ff00c8, #7a5cff)", transform: split ? "translateX(-100%)" : "none" }} />
      <div className="absolute inset-y-0 right-0 w-1/2 origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(.7,0,.2,1)]"
           style={{ background: "linear-gradient(225deg, #00e5ff, #0066ff)", transform: split ? "translateX(100%)" : "none" }} />
      <div className="relative text-center px-6" style={{ opacity: split ? 1 : 0, transition: "opacity .8s .8s" }}>
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-white/60">reveal</div>
        <h1 className="mt-4 text-7xl md:text-[11rem] font-black uppercase leading-[0.9] text-white">Split.</h1>
      </div>
    </section>
  );
}