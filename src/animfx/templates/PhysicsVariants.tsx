import { useEffect, useRef, useState } from "react";
import { palette } from "./palette";

export default function PhysicsVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 2;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <DragCards c1={c1} c2={c2} bg={bg} />;
  return <GravityBalls c1={c1} c2={c2} bg={bg} />;
}

function DragCards({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [cards] = useState(() => Array.from({ length: 6 }).map((_, i) => ({ id: i, x: 100 + i * 80, y: 100 + (i % 3) * 60, c: i % 2 ? c1 : c2 })));
  return (
    <div className="relative h-[70vh] overflow-hidden" style={{ background: bg }}>
      {cards.map((c) => <Draggable key={c.id} initial={{ x: c.x, y: c.y }} color={c.c} />)}
    </div>
  );
}

function Draggable({ initial, color }: { initial: { x: number; y: number }; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const drag = useRef({ dx: 0, dy: 0, on: false });
  useEffect(() => {
    const el = ref.current!;
    el.style.transform = `translate(${pos.x}px,${pos.y}px)`;
  }, [pos]);
  const down = (e: React.PointerEvent) => {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, on: true };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy });
  };
  const up = () => (drag.current.on = false);
  return <div ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} className="absolute left-0 top-0 h-32 w-32 cursor-grab touch-none rounded-2xl active:cursor-grabbing" style={{ background: color, boxShadow: `0 20px 60px ${color}55` }} />;
}

function GravityBalls({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cRef.current!;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const balls = Array.from({ length: 30 }).map(() => ({ x: Math.random() * c.width, y: Math.random() * c.height * 0.5, vx: (Math.random() - 0.5) * 2, vy: 0, r: 8 + Math.random() * 14, col: Math.random() < 0.5 ? c1 : c2 }));
    let raf = 0;
    const loop = () => {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
      balls.forEach((b) => {
        b.vy += 0.3; b.x += b.vx; b.y += b.vy;
        if (b.y + b.r > c.height) { b.y = c.height - b.r; b.vy *= -0.75; b.vx *= 0.98; }
        if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
        if (b.x + b.r > c.width) { b.x = c.width - b.r; b.vx *= -1; }
        ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [bg, c1, c2]);
  return <canvas ref={cRef} className="h-[70vh] w-full" />;
}