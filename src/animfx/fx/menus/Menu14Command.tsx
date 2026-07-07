import { useState, useEffect } from "react";
const CMDS=["Open Dashboard","New Project","Invite Team","Settings","Documentation","Log out"];
export default function Menu14Command(){
  const [o,setO]=useState(false);
  const [q,setQ]=useState("");
  useEffect(()=>{const f=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setO(v=>!v);}};window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f);},[]);
  const list = CMDS.filter(c=>c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">Command ⌘K</h1>
        <button onClick={()=>setO(true)} className="mt-8 rounded-lg border border-white/20 px-5 py-2 text-sm">Abrir palette</button></section>
      {o && (<div className="fixed inset-0 z-50 grid place-items-start bg-black/60 backdrop-blur pt-24" onClick={()=>setO(false)}>
        <div className="w-full max-w-lg rounded-xl border border-white/10 bg-neutral-900 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300" onClick={e=>e.stopPropagation()}>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="w-full bg-transparent px-4 py-4 text-lg outline-none border-b border-white/10"/>
          <ul className="max-h-72 overflow-auto p-2">
            {list.map((c,i)=>(<li key={i} className="rounded-lg px-3 py-2 hover:bg-fuchsia-500/20 cursor-pointer">{c}</li>))}
          </ul>
        </div>
      </div>)}
    </div>
  );
}
