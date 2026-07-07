const LINKS=["Home","About","Studio","Work","Journal","Contact","Careers","Press"];
export default function Menu21MarqueeNav(){
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="overflow-hidden border-y border-white/10 bg-black">
        <div className="flex whitespace-nowrap py-4 animate-[marquee_25s_linear_infinite]">
          {Array.from({length:4}).map((_,k)=>(<div key={k} className="flex gap-12 pr-12">{LINKS.map((l,i)=>(<a key={i} href="#" className="text-lg font-black uppercase hover:text-fuchsia-400">{l} <span className="text-fuchsia-400">●</span></a>))}</div>))}
        </div>
        <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-25%)}}`}</style>
      </nav>
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">Marquee Nav</h1></section>
    </div>
  );
}
