import { useEffect, useRef } from "react";

/**
 * CursorGlow
 * Moves the glow smoothly while the pointer is moving, then stops the
 * animation loop instead of consuming a frame on every idle screen.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const el = dotRef.current;
    if (!el) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;
    let raf = 0;

    const tick = () => {
      x += (mx - x) * 0.12;
      y += (my - y) * 0.12;
      el.style.transform = `translate3d(${x - 400}px, ${y - 400}px, 0)`;

      if (Math.abs(mx - x) > 0.5 || Math.abs(my - y) > 0.5) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      mx = event.clientX;
      my = event.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Position the glow once, then only animate in response to pointer movement.
    el.style.transform = `translate3d(${x - 400}px, ${y - 400}px, 0)`;
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        ref={dotRef}
        className="absolute size-[800px] rounded-full opacity-70 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.16 230 / 22%) 0%, oklch(0.5 0.2 240 / 8%) 40%, transparent 65%)",
          filter: "blur(20px)",
          transform: "translate3d(-9999px, -9999px, 0)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
