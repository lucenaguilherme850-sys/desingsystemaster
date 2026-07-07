const IMGS = [
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900",
  "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=900",
];
export default function Hover5ColorSplash(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Color Splash</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IMGS.map((src,i)=>(
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
              <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
