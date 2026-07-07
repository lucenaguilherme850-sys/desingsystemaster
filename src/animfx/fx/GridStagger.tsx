import { useEffect, useRef, useState } from "react";

export default function GridStagger() {
  const [key, setKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setKey((k) => k + 1); }),
      { threshold: 0.25 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const cells = Array.from({ length: 24 });
  return (
    <div ref={ref} className="min-h-[80vh] bg-background px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-neon">grid reveal</div>
        <h2 className="mt-3 text-4xl md:text-6xl font-black uppercase">staggered fade</h2>
        <div key={key} className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6">
          {cells.map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-border bg-card opacity-0"
              style={{
                animation: `gridReveal .7s cubic-bezier(.2,.7,.2,1) forwards`,
                animationDelay: `${(i % 6) * 60 + Math.floor(i / 6) * 90}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes gridReveal{from{opacity:0;transform:translate3d(0,24px,0) scale(.94)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}