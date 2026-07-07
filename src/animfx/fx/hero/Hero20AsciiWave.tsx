import { useEffect, useState } from "react";

export default function Hero20AsciiWave() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = () => { setT((performance.now() - start) / 1000); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  const rows = 18, cols = 80;
  const chars = " .:-=+*#%@";
  const grid: string[] = [];
  for (let y = 0; y < rows; y++) {
    let row = "";
    for (let x = 0; x < cols; x++) {
      const v = (Math.sin(x * 0.15 + t) + Math.cos(y * 0.3 + t * 0.7)) * 0.5 + 0.5;
      row += chars[Math.min(chars.length - 1, Math.floor(v * chars.length))];
    }
    grid.push(row);
  }
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black px-6">
      <pre className="pointer-events-none absolute inset-0 grid place-items-center whitespace-pre font-mono text-[10px] leading-none text-[#00ffb2]/60">
        {grid.join("\n")}
      </pre>
      <div className="relative text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-[#00ffb2]">terminal · v2</div>
        <h1 className="mt-4 text-6xl md:text-9xl font-black uppercase text-white">Wavefront</h1>
      </div>
    </section>
  );
}