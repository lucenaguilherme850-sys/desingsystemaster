import { useEffect, useState } from "react";
export default function Text17Counter() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const target = 12480;
    const dur = 2400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-neon">customers</div>
        <div className="mt-3 font-mono text-7xl md:text-9xl font-black tabular-nums">
          {n.toLocaleString()}
        </div>
      </div>
    </div>
  );
}