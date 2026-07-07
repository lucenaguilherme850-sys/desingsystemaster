import { useEffect, useState } from "react";

const LINES = ["Design", "in motion", "for the web"];

export default function Text2SplitLines() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 200);
    const i = setInterval(() => setOn((v) => !v), 3200);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="space-y-2">
        {LINES.map((l, i) => (
          <div key={i} className="overflow-hidden">
            <div
              className="font-mono text-5xl md:text-7xl font-black uppercase tracking-tight text-foreground transition-transform duration-700"
              style={{
                transform: on ? "translateY(0)" : "translateY(110%)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}