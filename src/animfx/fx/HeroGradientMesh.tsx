export default function HeroGradientMesh() {
  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-black">
      <div className="absolute -left-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full bg-[#00e5ff] opacity-60 blur-3xl" style={{ animation: "meshA 14s ease-in-out infinite" }} />
      <div className="absolute right-0 top-0 h-[50vh] w-[50vh] rounded-full bg-[#ff00c8] opacity-50 blur-3xl" style={{ animation: "meshB 18s ease-in-out infinite" }} />
      <div className="absolute bottom-0 left-1/3 h-[55vh] w-[55vh] rounded-full bg-[#7a5cff] opacity-60 blur-3xl" style={{ animation: "meshC 20s ease-in-out infinite" }} />
      <div className="relative z-10 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-white/80">gradient mesh hero</div>
        <h1 className="mt-4 text-6xl md:text-8xl font-black uppercase text-white">Motion</h1>
      </div>
      <style>{`
        @keyframes meshA{0%,100%{transform:translate(0,0)}50%{transform:translate(30vw,-10vh)}}
        @keyframes meshB{0%,100%{transform:translate(0,0)}50%{transform:translate(-25vw,25vh)}}
        @keyframes meshC{0%,100%{transform:translate(0,0)}50%{transform:translate(20vw,-20vh)}}
      `}</style>
    </div>
  );
}