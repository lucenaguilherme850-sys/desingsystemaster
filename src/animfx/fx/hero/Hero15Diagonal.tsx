export default function Hero15Diagonal() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#050914]">
      <div className="absolute inset-0 -skew-y-6" style={{ background: "linear-gradient(90deg, transparent, #ff5b0033, transparent)" }} />
      <div className="absolute inset-0 skew-y-12" style={{ background: "linear-gradient(90deg, transparent, #7a5cff22, transparent)" }} />
      <div className="relative text-center px-6">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#ffcc00]">independent · 2015 →</div>
        <h1 className="mt-4 text-7xl md:text-[12rem] font-black uppercase leading-[0.85] text-white">
          Off<br /><span className="italic text-[#ffcc00]">axis</span>
        </h1>
      </div>
    </section>
  );
}