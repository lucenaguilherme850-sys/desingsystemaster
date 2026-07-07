export default function Hover9GradientSweep(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Gradient Sweep</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900 p-[2px]">
              <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,transparent_0%,#f0f_25%,transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-spin [animation-duration:3s]" />
              <div className="relative flex h-full flex-col justify-between rounded-2xl bg-neutral-950 p-6">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">sweep</div>
                <div className="text-2xl font-black text-white">Card 0{i+1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
