export default function Hover12FlipCard(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24 [perspective:1200px]">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Flip Card</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="group relative aspect-[4/5] [transform-style:preserve-3d] transition-transform duration-700 hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-fuchsia-500 [backface-visibility:hidden] text-3xl font-black text-white">0{i+1}</div>
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-cyan-400 [backface-visibility:hidden] [transform:rotateY(180deg)] text-center text-black">
                <div>
                  <div className="text-xl font-black uppercase">Flip Back</div>
                  <div className="mt-1 font-mono text-xs">read more →</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
