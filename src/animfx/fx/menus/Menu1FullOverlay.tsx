import { useState } from "react";
const LINKS=["Home","Work","Studio","Journal","Contact"];
export default function Menu1FullOverlay(){
  const [open,setOpen]=useState(false);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6"><div className="font-black uppercase">Aperture</div>
        <button onClick={()=>setOpen(true)} className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold hover:bg-white hover:text-black">Menu</button>
      </nav>
      <div className={"fixed inset-0 z-50 bg-fuchsia-500 transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)] "+(open?"translate-y-0":"-translate-y-full")}>
        <button onClick={()=>setOpen(false)} className="absolute right-8 top-6 text-lg">✕ Close</button>
        <ul className="mx-auto flex h-full max-w-4xl flex-col justify-center gap-6 px-8">
          {LINKS.map((l,i)=><li key={i} className="text-6xl md:text-8xl font-black uppercase hover:italic">{l}</li>)}
        </ul>
      </div>
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">Full Overlay</h1></section>
    </div>
  );
}
