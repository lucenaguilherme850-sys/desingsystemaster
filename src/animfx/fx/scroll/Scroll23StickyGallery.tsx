import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll23StickyGallery() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    const track = ref.current!.querySelector<HTMLDivElement>("[data-track]")!;
    const move = track.scrollWidth - window.innerWidth + 80;
    track.style.transform = `translate3d(${-p * move}px,0,0)`;
  });
  const items = [
    { t: "Aurora", c: "#00e5ff" }, { t: "Ember", c: "#ff5b00" },
    { t: "Fjord", c: "#7a5cff" }, { t: "Mirage", c: "#ff00c8" },
    { t: "Onyx", c: "#a4ff00" }, { t: "Halcyon", c: "#ffcc00" },
  ];
  return (
    <div ref={ref} className="relative h-[500vh]" style={{ background: "#050914" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div data-track className="flex gap-8 pl-[10vw] will-change-transform">
          {items.map((it, i) => (
            <figure key={i} className="relative flex h-[72vh] w-[60vw] max-w-[640px] shrink-0 flex-col justify-end overflow-hidden rounded-3xl">
              <div className="absolute inset-0" style={{ background: `radial-gradient(70% 60% at 30% 30%, ${it.c}, transparent 70%), #0a0a18` }} />
              <figcaption className="relative p-8">
                <div className="font-mono text-xs uppercase tracking-widest" style={{ color: it.c }}>0{i + 1} / 06</div>
                <div className="mt-2 text-6xl font-black uppercase text-white">{it.t}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}