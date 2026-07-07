import { useState } from "react";
const SECTIONS=["Intro","About","Work","Team","Contact"];
export default function Menu10DotsIndicator(){
  const [i,setI]=useState(0);
  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <div className="fixed right-8 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-4">
        {SECTIONS.map((s,k)=>(
          <button key={k} onClick={()=>setI(k)} className="group flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">{s}</span>
            <span className={"block h-2 rounded-full bg-white transition-all "+(i===k?"w-8":"w-2 opacity-50")}/>
          </button>
        ))}
      </div>
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">{SECTIONS[i]}</h1></section>
    </div>
  );
}
