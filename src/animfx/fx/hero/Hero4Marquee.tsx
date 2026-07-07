export default function Hero4Marquee() {
  return (
    <section className="relative flex min-h-[80vh] flex-col justify-between overflow-hidden bg-[#050914] py-20">
      <div className="grid place-items-center px-6">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#00e5ff]">independent studio · est 2024</div>
          <h1 className="mt-4 text-6xl md:text-8xl font-black uppercase text-white">Signal / Noise</h1>
          <p className="mx-auto mt-6 max-w-xl text-white/60">Websites and brand systems for teams that refuse the default.</p>
        </div>
      </div>
      <div className="mt-20 space-y-3">
        <Row dir="left" text="MOTION · TYPE · CODE · SYSTEM · " color="#fff" />
        <Row dir="right" text="◆ SIGNAL / NOISE · " color="#00e5ff" />
        <Row dir="left" text="AVAILABLE FOR Q3 · " color="#fff" />
      </div>
    </section>
  );
}
function Row({ dir, text, color }: { dir: "left" | "right"; text: string; color: string }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="inline-flex gap-6 will-change-transform" style={{ animation: `hero4-${dir} 25s linear infinite` }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="text-4xl md:text-6xl font-black uppercase tracking-tight" style={{ color }}>{text}</span>
        ))}
      </div>
      <style>{`
        @keyframes hero4-left { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes hero4-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  );
}