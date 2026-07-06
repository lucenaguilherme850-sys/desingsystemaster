import { useEffect, useRef } from "react";

export function IgCursor3Lerp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const l1 = useRef<HTMLDivElement>(null);
  const l2 = useRef<HTMLDivElement>(null);
  const l3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !l1.current || !l2.current || !l3.current) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const target = { x: 0, y: 0 };
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 0, y: 0 };
    const p3 = { x: 0, y: 0 };
    let raf = 0;
    let active = false;

    const tick = () => {
      p1.x += (target.x - p1.x) * 0.22;
      p1.y += (target.y - p1.y) * 0.22;
      p2.x += (p1.x - p2.x) * 0.14;
      p2.y += (p1.y - p2.y) * 0.14;
      p3.x += (p2.x - p3.x) * 0.08;
      p3.y += (p2.y - p3.y) * 0.08;
      if (l1.current) l1.current.style.transform = `translate3d(${p1.x}px, ${p1.y}px, 0)`;
      if (l2.current) l2.current.style.transform = `translate3d(${p2.x}px, ${p2.y}px, 0)`;
      if (l3.current) l3.current.style.transform = `translate3d(${p3.x}px, ${p3.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      if (!active) {
        active = true;
        p1.x = p2.x = p3.x = target.x;
        p1.y = p2.y = p3.y = target.y;
        root.dataset.active = "true";
      }
    };
    const onLeave = () => {
      active = false;
      root.dataset.active = "false";
    };

    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-active="false"
      className="relative min-h-[360px] overflow-hidden rounded-md border border-border bg-card grid-bg cursor-none data-[active=false]:cursor-default"
    >
      <div className="pointer-events-none absolute left-0 top-0 grid h-full w-full place-items-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          mova o mouse dentro da área
        </p>
      </div>
      <div
        ref={l3}
        className="pointer-events-none absolute left-0 top-0 -ml-8 -mt-8 size-16 rounded-full border border-neon/30 mix-blend-difference will-change-transform"
      />
      <div
        ref={l2}
        className="pointer-events-none absolute left-0 top-0 -ml-4 -mt-4 size-8 rounded-full border border-neon/60 mix-blend-difference will-change-transform"
      />
      <div
        ref={l1}
        className="pointer-events-none absolute left-0 top-0 -ml-1 -mt-1 size-2 rounded-full bg-neon will-change-transform"
      />
    </div>
  );
}