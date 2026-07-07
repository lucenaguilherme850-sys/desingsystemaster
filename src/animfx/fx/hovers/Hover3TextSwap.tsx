const ITEMS = ["Studios","Projects","About","Journal","Contact","Careers"];
export default function Hover3TextSwap(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-black uppercase text-white">Text Swap</h2>
        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {ITEMS.map((t,i)=>(
            <li key={i} className="group relative overflow-hidden">
              <a href="#" className="flex items-center justify-between py-6">
                <span className="relative block overflow-hidden text-4xl md:text-6xl font-black uppercase text-white">
                  <span className="block transition-transform duration-500 ease-[cubic-bezier(.7,0,.3,1)] group-hover:-translate-y-full">{t}</span>
                  <span className="absolute inset-0 block translate-y-full text-fuchsia-400 transition-transform duration-500 ease-[cubic-bezier(.7,0,.3,1)] group-hover:translate-y-0">{t}</span>
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-white/40 transition-all duration-500 group-hover:translate-x-2 group-hover:text-fuchsia-300">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
