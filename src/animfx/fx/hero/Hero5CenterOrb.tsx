export default function Hero5CenterOrb() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="h-[70vmin] w-[70vmin] rounded-full blur-3xl opacity-70"
             style={{ background: "conic-gradient(from 0deg, #7a5cff, #ff00c8, #00e5ff, #7a5cff)", animation: "hero5-spin 18s linear infinite" }} />
      </div>
      <div className="relative text-center px-6">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-white/70">approaching</div>
        <h1 className="mt-4 text-6xl md:text-9xl font-black uppercase text-white">Nova</h1>
        <p className="mx-auto mt-4 max-w-md text-white/70">A new engine for interactive brand storytelling.</p>
      </div>
      <style>{`@keyframes hero5-spin { to { transform: rotate(360deg) } }`}</style>
    </section>
  );
}