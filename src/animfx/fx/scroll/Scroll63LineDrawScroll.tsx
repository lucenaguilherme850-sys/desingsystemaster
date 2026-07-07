import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll63LineDrawScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => { ref.current!.style.setProperty("--p", String(p)); });
  const path = "M40 400 Q 200 60 400 320 T 760 200 Q 900 120 1160 380";
  return (
    <div ref={ref} className="relative h-[300vh] bg-[#050914]">
      <div className="sticky top-0 grid h-screen place-items-center">
        <svg viewBox="0 0 1200 500" className="h-[70vh] w-[90vw] max-w-6xl">
          <defs>
            <linearGradient id="s63" x1="0" x2="1">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#ff00c8" />
            </linearGradient>
          </defs>
          <path d={path} stroke="url(#s63)" strokeWidth="4" fill="none" strokeLinecap="round"
                style={{ strokeDasharray: 2400, strokeDashoffset: "calc((1 - var(--p, 0)) * 2400)" }} />
          <path d={path} stroke="#ffffff08" strokeWidth="4" fill="none" />
        </svg>
      </div>
    </div>
  );
}