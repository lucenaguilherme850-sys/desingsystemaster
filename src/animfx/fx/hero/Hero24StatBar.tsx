export default function Hero24StatBar() {
  const stats = [
    { k: "years", v: "11" }, { k: "clients", v: "84" },
    { k: "awards", v: "37" }, { k: "coffee ℓ", v: "∞" },
  ];
  return (
    <section className="relative flex min-h-[80vh] flex-col justify-between overflow-hidden bg-[#0f0518] px-6 py-16">
      <div className="grid flex-1 place-items-center">
        <div className="text-center max-w-4xl">
          <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#c964ff]">since twenty fifteen</div>
          <h1 className="mt-4 text-6xl md:text-9xl font-black uppercase leading-[0.9] text-white">Small<br />team.<br /><span className="text-[#ff9ecb]">Big surface.</span></h1>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6 border-t border-white/10 pt-8">
        {stats.map((s) => (
          <div key={s.k}>
            <div className="text-4xl md:text-6xl font-black tabular-nums text-white">{s.v}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/50">{s.k}</div>
          </div>
        ))}
      </div>
    </section>
  );
}