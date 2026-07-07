export default function Hero22Portal() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="absolute rounded-full border-2"
               style={{
                 width: `${20 + i * 15}vmin`, height: `${20 + i * 15}vmin`,
                 borderColor: ["#00e5ff", "#7a5cff", "#ff00c8", "#a4ff00", "#ffcc00"][i],
                 animation: `hero22-spin ${8 + i * 3}s linear infinite ${i % 2 ? "reverse" : ""}`,
                 borderStyle: i % 2 ? "dashed" : "solid",
                 opacity: 0.6,
               }} />
        ))}
      </div>
      <div className="relative text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-white/60">enter</div>
        <h1 className="mt-4 text-6xl md:text-9xl font-black uppercase text-white">Portal</h1>
      </div>
      <style>{`@keyframes hero22-spin { to { transform: rotate(360deg) } }`}</style>
    </section>
  );
}