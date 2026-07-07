import { useState } from "react";
const LINKS=["Overview","Products","Pricing","Docs","Blog"];
export default function Menu4SideDrawer(){
  const [o,setO]=useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6"><div className="font-black uppercase">Vessel</div>
        <button onClick={()=>setO(true)} className="text-sm font-semibold uppercase">Menu</button></nav>
      <div className={"fixed inset-0 z-40 bg-black/60 backdrop-blur transition-opacity "+(o?"opacity-100":"pointer-events-none opacity-0")} onClick={()=>setO(false)}/>
      <aside className={"fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-900 p-10 shadow-2xl transition-transform duration-500 "+(o?"translate-x-0":"translate-x-full")}>
        <button onClick={()=>setO(false)} className="mb-10 text-sm">✕</button>
        <ul className="space-y-4">
          {LINKS.map((l,i)=><li key={i} className="border-b border-white/10 pb-3 text-3xl font-black uppercase hover:text-fuchsia-400">{l}</li>)}
        </ul>
      </aside>
    </div>
  );
}
