const ICONS=["◐","◈","◉","◇","◆","◐","◍"];
export default function Menu6BottomDock(){
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 text-white">
      <section className="px-8 py-32"><h1 className="text-6xl font-black uppercase">Bottom Dock</h1></section>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-xl">
        {ICONS.map((c,i)=>(
          <button key={i} className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 text-2xl transition-all hover:-translate-y-3 hover:scale-125 hover:bg-white hover:text-black">{c}</button>
        ))}
      </div>
    </div>
  );
}
