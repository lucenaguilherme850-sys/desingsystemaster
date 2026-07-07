import { useState } from "react";
const ACTS=[{i:"✎",l:"New Post"},{i:"◈",l:"New Board"},{i:"◉",l:"Invite"},{i:"◐",l:"Settings"}];
export default function Menu17FloatingFab(){
  const [o,setO]=useState(false);
  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">Floating Actions</h1></section>
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {ACTS.map((a,i)=>(<div key={i} className={"flex items-center gap-3 transition-all duration-300 "+(o?"opacity-100 translate-y-0":"opacity-0 translate-y-2 pointer-events-none")} style={{transitionDelay:`${(ACTS.length-i)*40}ms`}}>
          <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">{a.l}</span>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-white text-black">{a.i}</button>
        </div>))}
        <button onClick={()=>setO(v=>!v)} className={"grid h-16 w-16 place-items-center rounded-full bg-fuchsia-500 text-3xl shadow-lg transition-transform "+(o?"rotate-45":"")}>+</button>
      </div>
    </div>
  );
}
