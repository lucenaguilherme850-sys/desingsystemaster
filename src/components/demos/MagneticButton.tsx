import { useEffect, useRef } from "react";

export function MagneticButton() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const inner = innerRef.current;
    if (!btn || !inner) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const state = { tx: 0, ty: 0, cx: 0, cy: 0 };
    let raf = 0;
    const strength = 0.35;
    const ease = 0.15;
    const radius = 140;

    const loop = () => {
      state.cx += (state.tx - state.cx) * ease;
      state.cy += (state.ty - state.cy) * ease;
      inner.style.transform = `translate3d(${state.cx}px, ${state.cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        state.tx = dx * strength;
        state.ty = dy * strength;
      } else {
        state.tx = 0;
        state.ty = 0;
      }
    };
    const onLeave = () => {
      state.tx = 0;
      state.ty = 0;
    };

    window.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="grid min-h-[300px] place-items-center">
      <button
        ref={btnRef}
        className="group relative rounded-full border border-border bg-card px-8 py-4 font-mono text-sm tracking-tight transition-colors hover:border-neon"
      >
        <span
          ref={innerRef}
          className="inline-flex items-center gap-2 will-change-transform"
        >
          <span className="size-1.5 rounded-full bg-neon" /> Get started
        </span>
      </button>
    </div>
  );
}