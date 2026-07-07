export default function Hero7SidebySide() {
  return (
    <section className="relative grid min-h-[80vh] grid-cols-1 overflow-hidden bg-[#050914] md:grid-cols-2">
      <div className="relative grid place-items-center px-8 py-16">
        <div className="max-w-lg">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-[#ff00c8]">case 01 · nova</div>
          <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase leading-[0.95] text-white">Rebuild<br />the wonder.</h1>
          <p className="mt-6 text-white/60">A launch site built end-to-end in six weeks. Bespoke shaders, real-time particles, one narrative arc.</p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black">See case</button>
            <button className="rounded-full border border-white/30 px-6 py-2 text-sm font-bold text-white">Watch reel</button>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 60% 40%, #ff00c8, transparent 70%), linear-gradient(160deg, #7a5cff, #0a0518)" }} />
        <div className="absolute inset-8 rounded-2xl border border-white/10" style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,.03)" }} />
      </div>
    </section>
  );
}