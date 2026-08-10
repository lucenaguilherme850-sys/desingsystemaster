import { useEffect, useRef } from "react";

/**
 * CursorGlow
 * -------------------------------------------------------
 * Halo cyan radial de baixa opacidade que segue o cursor com
 * lerp. Fixado no viewport, atrás de todo o conteúdo. Recria
 * a "névoa" azulada que o designmaster.com.br tem ao mover o mouse.
 * Desativa em prefers-reduced-motion e em toque.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const el = dotRef.current;
    if (!el) return;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const tick = () => {
      x += (mx - x) * 0.08;
      y += (my - y) * 0.08;
      el.style.transform = `translate3d(${x - 400}px, ${y - 400}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
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