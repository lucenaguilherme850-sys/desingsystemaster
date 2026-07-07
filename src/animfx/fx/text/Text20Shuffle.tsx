import { useEffect, useState } from "react";
const TARGET = "REORDER";
function shuffle(s: string) {
  const a = s.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
}
export default function Text20Shuffle() {
  const [txt, setTxt] = useState(TARGET);
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n++;
      if (n > 8) { setTxt(TARGET); n = 0; }
      else setTxt(shuffle(TARGET));
    }, 180);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="font-mono text-6xl md:text-8xl font-black uppercase tracking-widest text-neon">
        {txt}
      </div>
    </div>
  );
}