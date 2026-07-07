import { useEffect, useState } from "react";
const TEXT = "STAGGER";
export default function Text5CharStagger() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((v) => v + 1), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div key={k} className="flex gap-2">
        {TEXT.split("").map((c, i) => (
          <span
            key={i}
            className="inline-block font-mono text-6xl md:text-8xl font-black"
            style={{
              animation: `charDrop 700ms ${i * 80}ms cubic-bezier(.2,.9,.3,1.2) both`,
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <style>{`@keyframes charDrop{0%{transform:translateY(-80px) rotate(-15deg);opacity:0}100%{transform:translateY(0) rotate(0);opacity:1}}`}</style>
    </div>
  );
}