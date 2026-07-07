import { useState, useEffect } from "react";
const LINKS=["Home","About","Work","Press","Contact"];
export default function Menu9BlurNav(){
  const [s,setS]=useState(false);
  useEffect(()=>{const f=()=>setS(window.scrollY>40);f();window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f);},[]);
  return (
    <div className="min-h-[200vh] bg-gradient-to-b from-neutral-950 via-purple-950 to-neutral-950 text-white">
      <nav className={"fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 transition-all "+(s?"py-3 bg-black/50 backdrop-blur-xl border-b border-white/10":"py-6 bg-transparent")}>
        <div className="font-black uppercase">Ember</div>
        <ul className="flex gap-6 text-sm font-semibold">{LINKS.map((l,i)=><li key={i} className="hover:text-fuchsia-400">{l}</li>)}</ul>
      </nav>
      <section className="px-8 pt-40"><h1 className="text-6xl font-black uppercase">Scroll para ver o blur</h1></section>
    </div>
  );
}
