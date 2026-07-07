import { useEffect, useState } from "react";
export default function Text16Split() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="relative font-mono text-6xl md:text-8xl font-black uppercase tracking-tight leading-none">
        <div
          className="overflow-hidden transition-transform duration-700"
          style={{ transform: on ? "translateY(0)" : "translateY(-30%)", clipPath: "inset(0 0 50% 0)" }}
        >
          Split
        </div>
        <div
          className="absolute inset-0 overflow-hidden transition-transform duration-700 text-neon"
          style={{ transform: on ? "translateY(0)" : "translateY(30%)", clipPath: "inset(50% 0 0 0)" }}
        >
          Split
        </div>
      </div>
    </div>
  );
}