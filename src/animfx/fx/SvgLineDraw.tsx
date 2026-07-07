import { useEffect, useState } from "react";

export default function SvgLineDraw() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="grid min-h-[60vh] place-items-center bg-background">
      <svg viewBox="0 0 400 200" className="w-[80vw] max-w-2xl">
        <defs>
          <linearGradient id="lg" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(.82 .17 225)" />
            <stop offset="100%" stopColor="oklch(.75 .2 300)" />
          </linearGradient>
        </defs>
        {["M20 150 Q100 20 200 100 T380 60", "M20 170 Q120 60 200 140 T380 90"].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="url(#lg)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: 900,
              strokeDashoffset: go ? 0 : 900,
              transition: `stroke-dashoffset 2s cubic-bezier(.6,.05,.3,1) ${i * 300}ms`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}