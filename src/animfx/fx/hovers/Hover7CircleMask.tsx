const IMGS = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900",
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=900",
];
export default function Hover7CircleMask(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-5xl font-black uppercase text-white">Circle Reveal</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {IMGS.map((src,i)=>(
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-black">
              <div className="absolute inset-0 bg-neutral-800" />
              <img src={src} loading="lazy" alt="" className="absolute inset-0 h-full w-full object-cover [clip-path:circle(0%_at_50%_50%)] transition-[clip-path] duration-700 ease-[cubic-bezier(.7,0,.3,1)] group-hover:[clip-path:circle(75%_at_50%_50%)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
