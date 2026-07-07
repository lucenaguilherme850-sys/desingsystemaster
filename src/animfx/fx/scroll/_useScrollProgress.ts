import { useEffect } from "react";

// Progresso 0..1 do scroll dentro do elemento (top toca o topo → 0; bottom toca fundo → 1).
export function useScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  cb: (p: number) => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        cb(Math.min(1, Math.max(0, -r.top / (total || 1))));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [ref, cb]);
}

// Velocidade normalizada do scroll (últimos ~150ms). Útil para skew, drag, etc.
export function useScrollVelocity(cb: (v: number) => void) {
  useEffect(() => {
    let last = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const now = performance.now();
        const dy = window.scrollY - last;
        const dt = Math.max(1, now - lastT);
        last = window.scrollY;
        lastT = now;
        cb(dy / dt);
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, [cb]);
}