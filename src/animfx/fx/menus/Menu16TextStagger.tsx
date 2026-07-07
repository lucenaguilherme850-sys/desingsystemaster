import { useState } from "react";
const LINKS=["Vision","Studio","Work","Journal","Contact"];
export default function Menu16TextStagger(){
  const [o,setO]=useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6"><div className="font-black uppercase">Nomad</div>
        <button onClick={()=>setO(v=>!v)} className="text-sm font-semibold uppercase">{o?"Close":"Menu"}</button></nav>
      <div className={"fixed inset-0 z-50 flex flex-col items-start justify-center gap-2 bg-black px-16 transition-all duration-500 "+(o?"opacity-100":"pointer-events-none opacity-0")}>
        {LINKS.map((l,i)=>(<div key={i} className="overflow-hidden">
          <div className={"text-6xl md:text-8xl font-black uppercase transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)] "+(o?"translate-y-0":"translate-y-full")} style={{transitionDelay:o?`${i*80+100}ms`:"0ms"}}>{l}</div>
        </div>))}
      </div>
    </div>
  );
}
