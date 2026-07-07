import { useState } from "react";
const OPTS=["Daily","Weekly","Monthly","Yearly"];
export default function Menu19Segmented(){
  const [i,setI]=useState(0);
  return (
    <div className="min-h-screen bg-neutral-950 px-8 py-24 text-white">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-4xl font-black uppercase">Segmented</h2>
        <div className="mt-10 grid grid-cols-4 gap-0 rounded-xl border border-white/20 p-1">
          {OPTS.map((o,k)=>(<button key={k} onClick={()=>setI(k)} className={"relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors "+(i===k?"text-black":"text-white/70")}>{i===k && <span className="absolute inset-0 rounded-lg bg-cyan-400 transition-all"/>}<span className="relative">{o}</span></button>))}
        </div>
        <div className="mt-8 rounded-xl border border-white/10 bg-neutral-900 p-6 font-mono text-sm">→ view: {OPTS[i]}</div>
      </div>
    </div>
  );
}
