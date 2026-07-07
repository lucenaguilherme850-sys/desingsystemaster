export default function Hover17StickerPeel(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Sticker Peel</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="group relative aspect-square rounded-3xl bg-gradient-to-br from-fuchsia-500 to-orange-400 p-8 shadow-[8px_8px_0_#000] transition-transform duration-500 hover:-rotate-3 hover:shadow-[16px_16px_0_#000]">
              <div className="font-mono text-xs uppercase tracking-widest text-black/70">sticker</div>
              <div className="mt-24 text-4xl font-black uppercase text-black">Peel 0{i+1}</div>
              <div className="absolute right-4 top-4 h-16 w-16 origin-top-right rotate-0 rounded-tr-3xl bg-black/20 opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100 group-hover:-rotate-12" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
