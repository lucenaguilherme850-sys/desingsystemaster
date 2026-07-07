const IMGS = [
  "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900",
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=900",
  "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=900",
  "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=900",
  "https://images.unsplash.com/photo-1497015289639-54688650d173?w=900",
  "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=900",
];
export default function Hover1MagnifyImage(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Magnify</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IMGS.map((src,i)=>(
            <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-black">
              <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-30" />
              <div className="absolute bottom-4 left-4 font-mono text-xs uppercase tracking-widest text-white translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">view →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
