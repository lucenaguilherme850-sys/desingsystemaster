import { useRef } from "react";
function Card({ title }: { title: string }){
  const r = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent)=>{
    const b = r.current!.getBoundingClientRect();
    r.current!.style.setProperty("--x", `${e.clientX-b.left}px`);
    r.current!.style.setProperty("--y", `${e.clientY-b.top}px`);
  };
  return (
    <div ref={r} onMouseMove={move} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-6">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{background:"radial-gradient(300px circle at var(--x) var(--y), rgba(255,80,220,.25), transparent 60%)"}} />
      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">spotlight</div>
      <div className="mt-auto text-2xl font-black text-white">{title}</div>
    </div>
  );
}
export default function Hover6Spotlight(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Spotlight</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=><Card key={i} title={`Item 0${i+1}`}/>)}
        </div>
      </div>
    </section>
  );
}
