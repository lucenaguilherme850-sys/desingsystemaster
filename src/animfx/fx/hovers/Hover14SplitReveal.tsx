export default function Hover14SplitReveal(){
  const items = ["Aperture","Solstice","Meridian","Nomad","Pillar","Vessel"];
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Split Reveal</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t,i)=>(
            <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
              <div className="absolute inset-x-0 top-0 z-10 h-1/2 bg-fuchsia-500 transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)] group-hover:-translate-y-full" />
              <div className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-cyan-400 transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)] group-hover:translate-y-full" />
              <div className="absolute inset-0 z-20 grid place-items-center text-4xl font-black uppercase text-white mix-blend-difference">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
