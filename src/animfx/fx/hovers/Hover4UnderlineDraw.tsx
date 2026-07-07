const LINKS = ["Overview","Features","Pricing","Docs","Blog","Support"];
export default function Hover4UnderlineDraw(){
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-black uppercase text-white">Underline</h2>
        <nav className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
          {LINKS.map((t,i)=>(
            <a key={i} href="#" className="group relative inline-block text-2xl font-semibold text-white/80 hover:text-white">
              {t}
              <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-fuchsia-400 transition-transform duration-500 ease-[cubic-bezier(.7,0,.3,1)] group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
