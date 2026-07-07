import { useState } from "react";
const PATHS=[["Home"],["Home","Products"],["Home","Products","Analytics"],["Home","Products","Analytics","Reports"]];
export default function Menu18BreadcrumbMorph(){
  const [i,setI]=useState(0);
  return (
    <div className="min-h-screen bg-neutral-950 px-8 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-mono text-sm">
          {PATHS[i].map((p,k)=>(<span key={k} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300"><span>{p}</span>{k<PATHS[i].length-1 && <span className="text-white/30">/</span>}</span>))}
        </div>
        <div className="mt-8 flex gap-2">{PATHS.map((_,k)=>(<button key={k} onClick={()=>setI(k)} className={"rounded-full px-4 py-2 text-xs "+(i===k?"bg-fuchsia-500":"bg-white/10")}>Nível {k+1}</button>))}</div>
      </div>
    </div>
  );
}
