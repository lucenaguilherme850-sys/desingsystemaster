import { useEffect, useState } from "react";

export default function Hero14Ticker() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return (
    <section className="relative flex min-h-[80vh] flex-col justify-between overflow-hidden bg-[#0f0518]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-white/70">
        <span>studio · lisbon</span>
        <span className="tabular-nums text-[#ff9ecb]">{hh}:{mm}:{ss}</span>
      </div>
      <div className="grid flex-1 place-items-center px-6">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#c964ff]">available for q3</div>
          <h1 className="mt-4 text-6xl md:text-9xl font-black uppercase leading-[0.9] text-white">Let it<br />breathe.</h1>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 font-mono text-[11px] uppercase tracking-widest text-white/60">
        <span>◆ 04 open slots</span>
        <span>scroll ↓</span>
      </div>
    </section>
  );
}