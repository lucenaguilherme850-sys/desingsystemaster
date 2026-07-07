export default function Hero16BadgeStack() {
  const badges = ["Awwwards SOTD", "FWA of the Day", "CSS Design", "Netlify Feature", "Vercel Spotlight"];
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black px-6">
      <div className="text-center max-w-4xl">
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((b, i) => (
            <span key={b} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur"
                  style={{ animation: `hero16-in .8s cubic-bezier(.2,.9,.2,1) ${i * 90}ms both` }}>
              ★ {b}
            </span>
          ))}
        </div>
        <h1 className="mt-8 text-6xl md:text-9xl font-black uppercase text-white">Award-<br />winning<br />by default.</h1>
      </div>
      <style>{`@keyframes hero16-in { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }`}</style>
    </section>
  );
}