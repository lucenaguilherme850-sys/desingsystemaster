const ITEMS = ["Design","Direction","Code","Motion","Research","Craft"];
export default function Hover10MarqueeHover(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-black uppercase text-white">Marquee Hover</h2>
        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {ITEMS.map((t,i)=>(
            <li key={i} className="group relative flex items-center overflow-hidden py-6">
              <div className="flex w-full items-center gap-8 whitespace-nowrap text-5xl font-black uppercase text-white/40 transition-all duration-500 group-hover:text-white group-hover:animate-[marquee_10s_linear_infinite]">
                {Array.from({length:6}).map((_,k)=>(<span key={k}>{t} <span className="text-fuchsia-400">●</span></span>))}
              </div>
              <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
