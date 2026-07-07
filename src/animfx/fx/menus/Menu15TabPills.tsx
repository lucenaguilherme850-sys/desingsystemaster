import { useState } from "react";
const TABS=[{t:"Overview",c:"Métricas gerais e KPIs."},{t:"Analytics",c:"Gráficos e coortes."},{t:"Reports",c:"Exportações e PDFs."},{t:"Team",c:"Membros e papéis."}];
export default function Menu15TabPills(){
  const [i,setI]=useState(0);
  return (
    <div className="min-h-screen bg-neutral-950 px-8 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-4 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {TABS.map((t,k)=>(<button key={k} onClick={()=>setI(k)} className={"relative rounded-full px-4 py-2 text-sm font-semibold "+(i===k?"text-black":"text-white/70")}>{i===k && <span className="absolute inset-0 rounded-full bg-fuchsia-400 transition-all"/>}<span className="relative">{t.t}</span></button>))}
        </div>
        <div className="mt-10 rounded-2xl border border-white/10 bg-neutral-900 p-10">
          <h2 className="text-3xl font-black uppercase">{TABS[i].t}</h2>
          <p className="mt-4 text-white/70">{TABS[i].c}</p>
        </div>
      </div>
    </div>
  );
}
