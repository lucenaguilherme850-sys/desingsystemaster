export default function Hero12VideoFrame() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black px-6">
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 50%, #7a5cff33, transparent 70%)" }} />
      <div className="relative w-full max-w-5xl">
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #ff5b00, #7a5cff, #00e5ff)", animation: "hero12-shift 8s ease infinite alternate", backgroundSize: "200% 200%" }} />
          <div className="absolute inset-0 grid place-items-center">
            <button className="grid h-20 w-20 place-items-center rounded-full bg-white text-black shadow-2xl transition-transform hover:scale-110">
              <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor"><path d="M0 0v24l20-12z" /></svg>
            </button>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">reel · 2026</div>
              <div className="mt-1 text-3xl font-black uppercase">Selected work</div>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">02:14</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes hero12-shift { from { background-position: 0% 0% } to { background-position: 100% 100% } }`}</style>
    </section>
  );
}