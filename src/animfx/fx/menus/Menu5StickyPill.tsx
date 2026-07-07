import { useState } from "react";
const LINKS=["Home","Work","Studio","Journal","Contact"];
export default function Menu5StickyPill(){
  const [i,setI]=useState(0);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="sticky top-6 z-40 mx-auto mt-6 flex w-fit gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
        {LINKS.map((l,k)=>(
          <button key={k} onClick={()=>setI(k)} className={"relative rounded-full px-5 py-2 text-sm font-semibold transition-colors "+(i===k?"text-black":"text-white/70 hover:text-white")}>
            {i===k && <span className="absolute inset-0 rounded-full bg-white"/>}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>
      <section className="mx-auto max-w-4xl px-6 py-32"><h1 className="text-6xl font-black uppercase">{LINKS[i]}</h1></section>
    </div>
  );
}
