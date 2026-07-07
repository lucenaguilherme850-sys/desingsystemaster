export default function Hover19ShineGloss(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Shine Gloss</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 p-8">
              <div className="pointer-events-none absolute -inset-1 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
              <div className="relative">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">glass</div>
                <div className="mt-24 text-2xl font-black uppercase text-white">Card 0{i+1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
