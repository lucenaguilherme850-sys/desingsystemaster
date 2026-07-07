import { useState } from "react";
const ICONS=["◐","◇","◉","◆","◈","◍"];
export default function Menu12RadialPie(){
  const [o,setO]=useState(false);
  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">Radial Pie</h1></section>
      <div className="fixed bottom-10 right-10 z-50">
        {ICONS.map((c,i)=>{const a=(i/ICONS.length)*Math.PI*2 - Math.PI/2; const r=100;
          return (<button key={i} className={"absolute grid h-12 w-12 place-items-center rounded-full bg-white text-black transition-all duration-500 "+(o?"opacity-100":"opacity-0 pointer-events-none")}
            style={{transform:o?`translate(${Math.cos(a)*r}px,${Math.sin(a)*r}px)`:"translate(0,0)",transitionDelay:`${i*40}ms`}}>{c}</button>);
        })}
        <button onClick={()=>setO(v=>!v)} className={"relative grid h-16 w-16 place-items-center rounded-full bg-fuchsia-500 text-2xl transition-transform "+(o?"rotate-45":"")}>+</button>
      </div>
    </div>
  );
}
