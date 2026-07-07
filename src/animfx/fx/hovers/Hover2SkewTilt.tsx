import { useRef } from "react";
function Card({ title }: { title: string }){
  const r = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = r.current!; const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left)/b.width - .5;
    const y = (e.clientY - b.top)/b.height - .5;
    el.style.transform = `perspective(800px) rotateX(${-y*12}deg) rotateY(${x*12}deg) translateZ(20px)`;
  };
  const reset = () => { r.current!.style.transform = "perspective(800px) rotateX(0) rotateY(0)"; };
  return (
    <div ref={r} onMouseMove={move} onMouseLeave={reset} className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 p-6 transition-transform duration-200 ease-out will-change-transform">
      <div className="font-mono text-[10px] uppercase tracking-widest text-white/80">tilt</div>
      <div className="mt-auto text-2xl font-black text-white">{title}</div>
    </div>
  );
}
export default function Hover2SkewTilt(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">3D Tilt</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=><Card key={i} title={`Card 0${i+1}`} />)}
        </div>
      </div>
    </section>
  );
}
