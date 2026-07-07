import { useRef } from "react";
import { useScrollProgress } from "./_useScrollProgress";

export default function Scroll2VerticalPin() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, (p) => {
    const track = ref.current!.querySelector<HTMLDivElement>("[data-t]")!;
    track.style.transform = `translate3d(0, ${-p * (track.scrollHeight - window.innerHeight)}px, 0)`;
  });
  const items = [
    { t: "Craft", c: "#00e5ff" }, { t: "Code", c: "#ff00c8" },
    { t: "Ship", c: "#a4ff00" }, { t: "Iterate", c: "#ffcc00" },
  ];
  return (
    <div ref={ref} className="relative h-[380vh] bg-[#050914]">
      <div className="sticky top-0 flex h-screen overflow-hidden">
        <div className="grid w-1/2 place-items-center">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">vertical pin</div>
            <h2 className="mt-3 text-6xl font-black uppercase text-white">Cycle</h2>
          </div>
        </div>
        <div className="w-1/2 overflow-hidden">
          <div data-t className="flex flex-col will-change-transform">
            {items.map((it, i) => (
              <div key={i} className="grid h-screen place-items-center px-8"
                   style={{ background: `linear-gradient(160deg, ${it.c}, #050914 80%)` }}>
                <div className="text-8xl font-black uppercase text-white">{it.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}