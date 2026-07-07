export default function Text12Marquee() {
  const items = ["MOTION", "•", "TYPOGRAPHY", "•", "KINETIC", "•", "DESIGN", "•"];
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f] overflow-hidden">
      <div className="flex whitespace-nowrap gap-8" style={{ animation: "mq 18s linear infinite" }}>
        {[...items, ...items, ...items].map((w, i) => (
          <span
            key={i}
            className="font-mono text-6xl md:text-8xl font-black uppercase"
            style={{ WebkitTextStroke: "1.5px hsl(var(--neon))", color: i % 4 === 0 ? "hsl(var(--neon))" : "transparent" }}
          >
            {w}
          </span>
        ))}
      </div>
      <style>{`@keyframes mq{to{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}