const items = ["Framer", "GSAP", "Lenis", "Three.js", "Motion", "Rive", "P5.js", "WebGL", "Shaders", "Canvas"];

export function InfiniteMarquee() {
  const row = (dir: 1 | -1) => (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className="flex gap-3 w-max"
        style={{
          animation: `marquee-${dir === 1 ? "l" : "r"} 30s linear infinite`,
        }}
      >
        {[...items, ...items].map((it, i) => (
          <span
            key={i}
            className="rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs whitespace-nowrap"
            aria-hidden={i >= items.length}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid min-h-[300px] place-content-center gap-3 py-8">
      {row(1)}
      {row(-1)}
      <style>{`
        @keyframes marquee-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}