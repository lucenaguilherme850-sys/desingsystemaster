import { useEffect, useState } from "react";
const TEXT = "ELASTIC";
export default function Text19Elastic() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((v) => v + 1), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div key={k} className="flex">
        {TEXT.split("").map((c, i) => (
          <span
            key={i}
            className="inline-block font-mono text-6xl md:text-8xl font-black"
            style={{ animation: `bounce 900ms ${i * 70}ms cubic-bezier(.34,1.56,.64,1) both` }}
          >
            {c}
          </span>
        ))}
      </div>
      <style>{`@keyframes bounce{0%{transform:scale(0) rotate(-40deg);opacity:0}60%{transform:scale(1.25) rotate(6deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}`}</style>
    </div>
  );
}