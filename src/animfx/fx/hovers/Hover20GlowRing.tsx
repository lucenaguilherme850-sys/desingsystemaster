export default function Hover20GlowRing(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Glow Ring</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="group relative aspect-square rounded-full">
              <div className="absolute inset-0 rounded-full bg-fuchsia-500 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-70" />
              <div className="relative grid h-full w-full place-items-center rounded-full border-2 border-white/20 bg-neutral-900 text-6xl font-black uppercase text-white transition-all duration-700 group-hover:border-fuchsia-400 group-hover:scale-105">
                {String(i+1).padStart(2,'0')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
