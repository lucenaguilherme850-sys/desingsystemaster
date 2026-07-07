const TEXT = "WAVE MOTION";
export default function Text10Wave() {
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="flex">
        {TEXT.split("").map((c, i) => (
          <span
            key={i}
            className="font-mono text-6xl md:text-8xl font-black inline-block"
            style={{ animation: `wv 1.6s ${i * 90}ms ease-in-out infinite` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </div>
      <style>{`@keyframes wv{0%,100%{transform:translateY(0)}50%{transform:translateY(-24px);color:hsl(var(--neon))}}`}</style>
    </div>
  );
}