export default function Hero9Blueprint() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-[#04121a]">
      <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero9g" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#00ffb2" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero9g)" />
      </svg>
      <div className="relative max-w-4xl px-6 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#00ffb2]">technical preview · rev 0.42</div>
        <h1 className="mt-4 text-6xl md:text-8xl font-black uppercase text-white">Blueprint</h1>
        <p className="mx-auto mt-6 max-w-xl font-mono text-sm text-white/70">
          {"// draft the interaction before you draw the pixel."}
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#00ffb2]/40 bg-[#00ffb2]/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#00ffb2]">
          <span className="h-2 w-2 rounded-full bg-[#00ffb2] shadow-[0_0_8px_#00ffb2]" /> live
        </div>
      </div>
    </section>
  );
}