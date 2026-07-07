export default function Hover8BorderDraw(){
  const btns = ["Buy Now","Learn More","Contact","Book Demo","Download","Sign Up"];
  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-black uppercase text-white">Border Draw</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {btns.map((t,i)=>(
            <button key={i} className="group relative overflow-hidden px-6 py-5 text-lg font-semibold text-white">
              <span className="relative z-10">{t}</span>
              <span className="pointer-events-none absolute left-0 top-0 h-[2px] w-0 bg-fuchsia-400 transition-all duration-300 group-hover:w-full" />
              <span className="pointer-events-none absolute right-0 top-0 h-0 w-[2px] bg-fuchsia-400 transition-all delay-[300ms] duration-300 group-hover:h-full" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-[2px] w-0 bg-fuchsia-400 transition-all delay-[600ms] duration-300 group-hover:w-full" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-0 w-[2px] bg-fuchsia-400 transition-all delay-[900ms] duration-300 group-hover:h-full" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
