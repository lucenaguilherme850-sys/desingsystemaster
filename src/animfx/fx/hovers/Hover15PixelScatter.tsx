export default function Hover15PixelScatter(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Pixel Scatter</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-900">
              <div className="grid h-full w-full grid-cols-8 grid-rows-8">
                {Array.from({length:64}).map((_,k)=>(
                  <div key={k} className="bg-fuchsia-500 transition-all duration-500"
                    style={{transitionDelay:`${(k%8+Math.floor(k/8))*30}ms`}}
                    onMouseEnter={undefined} />
                ))}
              </div>
              <style>{`
                .group:hover > div > div:nth-child(4n){opacity:0}
                .group:hover > div > div:nth-child(3n+1){transform:scale(.2)}
                .group:hover > div > div:nth-child(5n){background:#22d3ee}
              `}</style>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-3xl font-black uppercase text-white mix-blend-difference">0{i+1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
