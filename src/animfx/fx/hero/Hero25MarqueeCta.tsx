export default function Hero25MarqueeCta() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black">
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 40%, #ff5b0022, transparent 70%)" }} />
      <div className="relative w-full text-center">
        <div className="overflow-hidden whitespace-nowrap py-6">
          <div className="inline-flex gap-8 text-6xl md:text-9xl font-black uppercase text-white will-change-transform" style={{ animation: "hero25-l 22s linear infinite" }}>
            {Array.from({ length: 8 }).map((_, i) => <span key={i}>let&apos;s make it move ★</span>)}
          </div>
        </div>
        <button className="mt-8 rounded-full bg-[#ff5b00] px-10 py-4 text-sm font-black uppercase tracking-widest text-black transition-transform hover:scale-105">
          start a project
        </button>
        <div className="overflow-hidden whitespace-nowrap py-6">
          <div className="inline-flex gap-8 text-6xl md:text-9xl font-black uppercase text-white/20 will-change-transform" style={{ animation: "hero25-r 26s linear infinite" }}>
            {Array.from({ length: 8 }).map((_, i) => <span key={i}>let&apos;s make it move ★</span>)}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes hero25-l { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes hero25-r { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>
    </section>
  );
}