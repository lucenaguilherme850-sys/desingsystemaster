export default function Hero23TypeGrid() {
  const rows = ["MOTION", "PIXEL", "CRAFT", "SIGNAL"];
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#050914] px-6">
      <div className="grid w-full max-w-6xl gap-2">
        {rows.map((r, ri) => (
          <div key={r} className="grid grid-cols-6 gap-2">
            {r.padEnd(6, " ").split("").map((ch, ci) => (
              <div key={ci} className="grid aspect-square place-items-center rounded-xl border text-3xl md:text-5xl font-black"
                   style={{
                     borderColor: ch === " " ? "transparent" : "#00e5ff33",
                     color: (ri + ci) % 3 === 0 ? "#00e5ff" : "#fff",
                     background: ch === " " ? "transparent" : ((ri + ci) % 5 === 0 ? "#00e5ff11" : "#0a0a1855"),
                     animation: ch === " " ? undefined : `hero23-in .5s ease ${(ri * 6 + ci) * 40}ms both`,
                   }}>
                {ch}
              </div>
            ))}
          </div>
        ))}
      </div>
      <style>{`@keyframes hero23-in { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: none } }`}</style>
    </section>
  );
}