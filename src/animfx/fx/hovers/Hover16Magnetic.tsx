import { useRef } from "react";
function Btn({ label }: { label: string }){
  const r = useRef<HTMLButtonElement>(null);
  const move = (e: React.MouseEvent)=>{
    const b = r.current!.getBoundingClientRect();
    const x = (e.clientX - (b.left+b.width/2))*.35;
    const y = (e.clientY - (b.top+b.height/2))*.35;
    r.current!.style.transform = `translate(${x}px,${y}px)`;
  };
  const reset = ()=>{ r.current!.style.transform = "translate(0,0)"; };
  return <button ref={r} onMouseMove={move} onMouseLeave={reset} className="rounded-full border border-white/20 px-8 py-4 text-lg font-semibold text-white transition-transform duration-300 hover:bg-fuchsia-500 hover:border-fuchsia-500">{label}</button>;
}
export default function Hover16Magnetic(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-black uppercase text-white">Magnetic</h2>
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          {["Discover","Contact","Portfolio","Newsletter","Studio","Book"].map((t,i)=><Btn key={i} label={t}/>)}
        </div>
      </div>
    </section>
  );
}
