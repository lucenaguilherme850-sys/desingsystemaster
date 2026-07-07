const IMGS = [
  "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=900",
  "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=900",
  "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=900",
  "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900",
  "https://images.unsplash.com/photo-1497015289639-54688650d173?w=900",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900",
];
export default function Hover13BlurRemove(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Blur Reveal</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IMGS.map((src,i)=>(
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
              <img src={src} loading="lazy" alt="" className="absolute inset-0 h-full w-full object-cover blur-lg brightness-75 transition-all duration-700 group-hover:blur-0 group-hover:brightness-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
