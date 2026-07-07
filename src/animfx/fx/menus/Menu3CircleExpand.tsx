import { useState } from "react";
const LINKS=["Work","Studio","Contact","Journal"];
export default function Menu3CircleExpand(){
  const [o,setO]=useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6"><div className="font-black uppercase">Halo</div>
        <button onClick={()=>setO(v=>!v)} className="relative z-[60] rounded-full bg-white text-black px-5 py-2 text-sm font-semibold">{o?"×":"◎"}</button></nav>
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className={"absolute right-6 top-6 aspect-square rounded-full bg-fuchsia-500 transition-all duration-[900ms] ease-[cubic-bezier(.7,0,.3,1)] "+(o?"w-[300vmax] -translate-x-1/2 translate-y-1/2":"w-8")}/>
        <ul className={"relative mx-auto flex h-screen max-w-4xl flex-col items-center justify-center gap-6 transition-opacity delay-500 "+(o?"opacity-100 pointer-events-auto":"opacity-0")}>
          {LINKS.map((l,i)=><li key={i} className="text-6xl font-black uppercase">{l}</li>)}
        </ul>
      </div>
    </div>
  );
}
