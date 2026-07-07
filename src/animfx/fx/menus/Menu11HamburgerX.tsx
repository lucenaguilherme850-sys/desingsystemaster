import { useState } from "react";
const LINKS=["Home","Studio","Work","Contact"];
export default function Menu11HamburgerX(){
  const [o,setO]=useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="font-black uppercase">Solstice</div>
        <button onClick={()=>setO(v=>!v)} className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-2">
          <span className={"block h-[2px] w-7 bg-white transition-transform duration-300 "+(o?"translate-y-[10px] rotate-45":"")}/>
          <span className={"block h-[2px] w-7 bg-white transition-opacity "+(o?"opacity-0":"opacity-100")}/>
          <span className={"block h-[2px] w-7 bg-white transition-transform duration-300 "+(o?"-translate-y-[10px] -rotate-45":"")}/>
        </button>
      </nav>
      <div className={"fixed inset-0 z-50 bg-neutral-900 transition-opacity duration-500 "+(o?"opacity-100":"pointer-events-none opacity-0")}>
        <ul className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-4">
          {LINKS.map((l,i)=>(<li key={i} className={"text-6xl font-black uppercase transition-all duration-500 "+(o?"translate-y-0 opacity-100":"translate-y-8 opacity-0")} style={{transitionDelay:o?`${i*80+200}ms`:"0ms"}}>{l}</li>))}
        </ul>
      </div>
    </div>
  );
}
