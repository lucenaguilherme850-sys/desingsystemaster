const WORDS = ["Ocean","Signal","Prism","Vertex","Halo","Ember"];
export default function Hover18WaveText(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-5xl font-black uppercase text-white">Wave Text</h2>
        <ul className="mt-12 space-y-4">
          {WORDS.map((w,i)=>(
            <li key={i} className="group flex items-baseline gap-4 border-b border-white/10 py-4">
              {w.split("").map((c,k)=>(
                <span key={k} className="inline-block text-5xl md:text-7xl font-black uppercase text-white transition-transform duration-500 ease-[cubic-bezier(.7,0,.3,1)] group-hover:-translate-y-3" style={{transitionDelay:`${k*40}ms`,color: k%2? "#f0f":"#fff"}}>{c}</span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
