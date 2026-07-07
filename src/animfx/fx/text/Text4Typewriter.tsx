import { useEffect, useState } from "react";
const PHRASES = ["const idea = build();", "function ship() { return magic; }", "await deploy(now);"];
export default function Text4Typewriter() {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const full = PHRASES[i];
    if (!del && txt === full) { const t = setTimeout(() => setDel(true), 1400); return () => clearTimeout(t); }
    if (del && txt === "") { setDel(false); setI((v) => (v + 1) % PHRASES.length); return; }
    const t = setTimeout(() => setTxt(del ? full.slice(0, txt.length - 1) : full.slice(0, txt.length + 1)), del ? 40 : 70);
    return () => clearTimeout(t);
  }, [txt, del, i]);
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="rounded-lg border border-border/60 bg-black/40 px-6 py-4 font-mono text-2xl md:text-4xl text-neon">
        <span>{txt}</span>
        <span className="ml-0.5 inline-block h-6 w-[3px] animate-pulse bg-neon align-middle" />
      </div>
    </div>
  );
}