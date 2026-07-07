import { useState } from "react";
const CATS=[{t:"Products",c:["Analytics","CMS","Automation","AI Studio","Integrations","API"]},{t:"Solutions",c:["Startups","Enterprise","Agencies","Ecommerce","Media"]},{t:"Resources",c:["Docs","Blog","Guides","Changelog","Support"]}];
export default function Menu8Mega(){
  const [o,setO]=useState<number|null>(null);
  return (
    <div className="min-h-screen bg-neutral-950 text-white" onMouseLeave={()=>setO(null)}>
      <nav className="relative z-40 flex items-center justify-between border-b border-white/10 px-8 py-4">
        <div className="font-black uppercase">Prism</div>
        <ul className="flex gap-8">
          {CATS.map((c,i)=>(
            <li key={i} onMouseEnter={()=>setO(i)}><button className="text-sm font-semibold uppercase hover:text-fuchsia-400">{c.t}</button></li>
          ))}
        </ul>
      </nav>
      <div className={"pointer-events-none absolute inset-x-0 z-30 origin-top border-b border-white/10 bg-neutral-900 transition-all duration-300 "+(o!==null?"pointer-events-auto opacity-100 translate-y-0":"opacity-0 -translate-y-4")}>
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-8 p-10">
          {o!==null && CATS[o].c.map((x,k)=>(
            <a key={k} className="rounded-xl p-4 hover:bg-white/5"><div className="font-semibold">{x}</div><div className="text-xs text-white/50">explore →</div></a>
          ))}
        </div>
      </div>
    </div>
  );
}
