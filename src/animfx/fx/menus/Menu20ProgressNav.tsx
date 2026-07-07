import { useEffect, useState } from "react";
const S=["Intro","Chapter 1","Chapter 2","Chapter 3","End"];
export default function Menu20ProgressNav(){
  const [p,setP]=useState(0);
  useEffect(()=>{const f=()=>{const h=document.documentElement;setP(h.scrollTop/(h.scrollHeight-h.clientHeight));};f();window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f);},[]);
  return (
    <div className="min-h-[300vh] bg-neutral-950 text-white">
      <div className="fixed left-8 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-6">
        {S.map((s,i)=>{const on = p*S.length >= i;
          return (<div key={i} className="flex items-center gap-3">
            <div className={"h-8 w-[2px] transition-colors "+(on?"bg-fuchsia-400":"bg-white/20")}/>
            <span className={"font-mono text-[11px] uppercase tracking-widest transition-colors "+(on?"text-white":"text-white/40")}>{s}</span>
          </div>);
        })}
      </div>
      {S.map((s,i)=>(<section key={i} className="grid h-screen place-items-center"><h1 className="text-6xl font-black uppercase">{s}</h1></section>))}
    </div>
  );
}
