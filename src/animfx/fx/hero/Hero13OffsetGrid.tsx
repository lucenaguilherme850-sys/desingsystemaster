export default function Hero13OffsetGrid() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-[#050914] py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#a4ff00]">2026 · portfolio</div>
          <h1 className="mt-4 text-6xl md:text-8xl font-black uppercase leading-[0.9] text-white">Zero<br />defaults.</h1>
          <p className="mt-6 max-w-md text-white/60">Every pixel, every easing curve, every millisecond — chosen on purpose.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 self-end">
          {["#a4ff00","#00c8b4","#ff00c8","#ffcc00"].map((c, i) => (
            <div key={i} className="aspect-square rounded-2xl border border-white/5"
                 style={{ background: `linear-gradient(160deg, ${c}, #0a0a18)`, transform: `translateY(${i % 2 ? 30 : 0}px)` }} />
          ))}
        </div>
      </div>
    </section>
  );
}