import { useState } from "react";
const LINKS=["Projects","Studio","Journal","Contact"];
export default function Menu2SplitCurtain(){
  const [o,setO]=useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6"><div className="font-black uppercase">Meridian</div>
        <button onClick={()=>setO(v=>!v)} className="text-sm font-semibold uppercase">{o?"Close":"Menu"}</button></nav>
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className={"absolute inset-y-0 left-0 w-1/2 bg-cyan-400 transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)] "+(o?"translate-x-0":"-translate-x-full")}/>
        <div className={"absolute inset-y-0 right-0 w-1/2 bg-fuchsia-500 transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)] "+(o?"translate-x-0":"translate-x-full")}/>
        <ul className={"absolute inset-0 mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 text-white transition-opacity delay-500 "+(o?"opacity-100 pointer-events-auto":"opacity-0")}>
          {LINKS.map((l,i)=><li key={i} className="text-6xl md:text-8xl font-black uppercase">{l}</li>)}
        </ul>
      </div>
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">Split Curtain</h1></section>
    </div>
  );
}
