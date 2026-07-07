import { useEffect, useRef } from "react";

export default function MagneticCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;
    const state = { x: 0, y: 0, rx: 0, ry: 0 };
    let raf = 0;
    const loop = () => {
      state.rx += (state.x - state.rx) * 0.18;
      state.ry += (state.y - state.ry) * 0.18;
      dot.style.transform = `translate3d(${state.x - 4}px, ${state.y - 4}px, 0)`;
      ring.style.transform = `translate3d(${state.rx - 24}px, ${state.ry - 24}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      state.x = e.clientX - r.left;
      state.y = e.clientY - r.top;
    };
    root.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("mousemove", onMove);
    };
  }, []);
  return (
    <div ref={rootRef} className="relative h-[80vh] w-full overflow-hidden bg-[#07090f] cursor-none">
      <div ref={ringRef} className="pointer-events-none absolute left-0 top-0 h-12 w-12 rounded-full border border-neon/70 mix-blend-difference" />
      <div ref={dotRef} className="pointer-events-none absolute left-0 top-0 h-2 w-2 rounded-full bg-neon" />
      <div className="grid h-full place-items-center">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-neon">custom cursor</div>
          <h2 className="mt-4 text-6xl md:text-8xl font-black uppercase">move the mouse</h2>
        </div>
      </div>
    </div>
  );
}