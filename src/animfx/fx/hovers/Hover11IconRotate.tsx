const CARDS = [
  {t:"Design", d:"visual language"},
  {t:"Code", d:"shipping product"},
  {t:"Motion", d:"reactive interfaces"},
  {t:"Research", d:"clarity in strategy"},
  {t:"Direction", d:"art of the whole"},
  {t:"Craft", d:"tiny details"},
];
export default function Hover11IconRotate(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-black uppercase text-white">Icon Rotate</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c,i)=>(
            <a key={i} href="#" className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-8">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-white">{c.t}</div>
                <div className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-transform duration-500 group-hover:rotate-[135deg] group-hover:bg-fuchsia-500 group-hover:border-fuchsia-500">↗</div>
              </div>
              <div className="mt-24 max-h-0 overflow-hidden text-sm text-white/60 transition-all duration-500 group-hover:max-h-32">{c.d}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
