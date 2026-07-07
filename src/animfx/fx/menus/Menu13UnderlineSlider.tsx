import { useState, useRef, useEffect } from "react";
const LINKS=["Home","Work","Studio","Journal","Contact"];
export default function Menu13UnderlineSlider(){
  const [i,setI]=useState(0);
  const refs=useRef<(HTMLButtonElement|null)[]>([]);
  const [s,setS]=useState({left:0,width:0});
  useEffect(()=>{const el=refs.current[i];if(el)setS({left:el.offsetLeft,width:el.offsetWidth});},[i]);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="relative mx-auto mt-16 flex w-fit gap-6 border-b border-white/10 px-6">
        {LINKS.map((l,k)=>(<button key={k} ref={el=>{refs.current[k]=el}} onClick={()=>setI(k)} className={"px-2 pb-4 text-sm font-semibold uppercase transition-colors "+(i===k?"text-white":"text-white/50")}>{l}</button>))}
        <span className="absolute -bottom-[2px] h-[3px] bg-fuchsia-400 transition-all duration-500" style={{left:s.left,width:s.width}}/>
      </nav>
      <section className="mx-auto max-w-4xl px-6 py-24"><h1 className="text-6xl font-black uppercase">{LINKS[i]}</h1></section>
    </div>
  );
}
