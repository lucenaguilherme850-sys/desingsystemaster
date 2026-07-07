import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll42TextClipReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => { ref.current!.style.setProperty("--p", String(p)); });
  return (
    <div ref={ref} className="relative h-[300vh] bg-[#050914]">
      <div className="sticky top-0 grid h-screen place-items-center px-6">
        <div className="relative max-w-5xl">
          <p className="text-3xl md:text-6xl font-black uppercase leading-[0.95] text-white/10">
            Designers ship pixels. We ship the motion between them — every scroll, every hover, every micro delay.
          </p>
          <p className="absolute inset-0 text-3xl md:text-6xl font-black uppercase leading-[0.95]"
             style={{
               background: "linear-gradient(90deg, #00e5ff, #ff00c8)",
               WebkitBackgroundClip: "text", backgroundClip: "text",
               WebkitTextFillColor: "transparent",
               clipPath: "inset(0 calc((1 - var(--p, 0)) * 100%) 0 0)",
             }}>
            Designers ship pixels. We ship the motion between them — every scroll, every hover, every micro delay.
          </p>
        </div>
      </div>
    </div>
  );
}