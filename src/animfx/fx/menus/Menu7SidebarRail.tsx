const LINKS=[{i:"◐",l:"Dashboard"},{i:"◇",l:"Projects"},{i:"◈",l:"Team"},{i:"◉",l:"Insights"},{i:"◆",l:"Settings"}];
export default function Menu7SidebarRail(){
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <aside className="group flex w-16 flex-col gap-2 border-r border-white/10 bg-neutral-900 p-3 transition-all duration-300 hover:w-56">
        {LINKS.map((l,i)=>(
          <button key={i} className="flex items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-white/10">
            <span className="text-2xl">{l.i}</span>
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">{l.l}</span>
          </button>
        ))}
      </aside>
      <section className="flex-1 p-16"><h1 className="text-6xl font-black uppercase">Sidebar Rail</h1></section>
    </div>
  );
}
