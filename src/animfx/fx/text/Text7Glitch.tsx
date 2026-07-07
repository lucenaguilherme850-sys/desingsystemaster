export default function Text7Glitch() {
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="relative font-mono text-6xl md:text-8xl font-black uppercase tracking-tight">
        <span className="relative z-10 text-foreground">GLITCH</span>
        <span aria-hidden className="absolute inset-0 text-[#ff003c] mix-blend-screen" style={{ animation: "gx 2.6s infinite steps(2)" }}>GLITCH</span>
        <span aria-hidden className="absolute inset-0 text-[#00e5ff] mix-blend-screen" style={{ animation: "gy 2.6s infinite steps(2)" }}>GLITCH</span>
        <style>{`
          @keyframes gx{0%,100%{transform:translate(0,0);clip-path:inset(0 0 60% 0)}20%{transform:translate(-3px,1px);clip-path:inset(15% 0 40% 0)}40%{transform:translate(2px,-2px);clip-path:inset(50% 0 10% 0)}}
          @keyframes gy{0%,100%{transform:translate(0,0);clip-path:inset(60% 0 0 0)}20%{transform:translate(3px,-1px);clip-path:inset(40% 0 15% 0)}40%{transform:translate(-2px,2px);clip-path:inset(10% 0 50% 0)}}
        `}</style>
      </div>
    </div>
  );
}