import { useState } from "react";
import { palette } from "./palette";

export default function TransitionVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 3;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <Curtain c1={c1} c2={c2} bg={bg} />;
  if (kind === 1) return <MaskWipe c1={c1} bg={bg} />;
  return <PanelsSlide c1={c1} c2={c2} bg={bg} />;
}

function Curtain({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [go, setGo] = useState(false);
  return (
    <div className="relative min-h-[70vh] overflow-hidden" style={{ background: bg }}>
      <button onClick={() => setGo(!go)} className="absolute right-6 top-6 z-30 rounded-full border px-5 py-2 font-mono text-xs uppercase text-white" style={{ borderColor: c1 }}>{go ? "back" : "transition"}</button>
      <div className="grid h-full min-h-[70vh] place-items-center">
        <h2 className="text-6xl md:text-8xl font-black uppercase text-white">Page A</h2>
      </div>
      <div className="absolute inset-0 z-20 flex">
        {[c1, c2, c1, c2, c1].map((c, i) => (
          <div key={i} className="h-full flex-1 origin-bottom" style={{ background: c, transform: go ? "scaleY(1)" : "scaleY(0)", transformOrigin: i % 2 ? "top" : "bottom", transition: `transform .6s ${i * 80}ms cubic-bezier(.7,0,.2,1)` }} />
        ))}
      </div>
    </div>
  );
}

function MaskWipe({ c1, bg }: { c1: string; bg: string }) {
  const [go, setGo] = useState(false);
  return (
    <div className="relative min-h-[70vh] overflow-hidden" style={{ background: bg }}>
      <button onClick={() => setGo(!go)} className="absolute right-6 top-6 z-30 rounded-full border px-5 py-2 font-mono text-xs uppercase text-white" style={{ borderColor: c1 }}>{go ? "reset" : "wipe"}</button>
      <div className="grid h-full min-h-[70vh] place-items-center"><h2 className="text-6xl md:text-8xl font-black uppercase text-white">Wipe</h2></div>
      <div className="pointer-events-none absolute inset-0 z-20" style={{ background: c1, clipPath: go ? "circle(150% at 50% 50%)" : "circle(0% at 50% 50%)", transition: "clip-path 1s cubic-bezier(.7,0,.2,1)" }} />
    </div>
  );
}

function PanelsSlide({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [go, setGo] = useState(false);
  return (
    <div className="relative min-h-[70vh] overflow-hidden" style={{ background: bg }}>
      <button onClick={() => setGo(!go)} className="absolute right-6 top-6 z-30 rounded-full border px-5 py-2 font-mono text-xs uppercase text-white" style={{ borderColor: c1 }}>{go ? "back" : "slide"}</button>
      <div className="grid h-full min-h-[70vh] place-items-center"><h2 className="text-6xl md:text-8xl font-black uppercase text-white">Panels</h2></div>
      <div className="absolute inset-y-0 left-0 z-20 w-1/2" style={{ background: c1, transform: go ? "translateX(0)" : "translateX(-100%)", transition: "transform .7s cubic-bezier(.7,0,.2,1)" }} />
      <div className="absolute inset-y-0 right-0 z-20 w-1/2" style={{ background: c2, transform: go ? "translateX(0)" : "translateX(100%)", transition: "transform .7s cubic-bezier(.7,0,.2,1)" }} />
    </div>
  );
}