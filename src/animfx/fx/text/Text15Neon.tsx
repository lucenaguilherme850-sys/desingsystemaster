export default function Text15Neon() {
  return (
    <div className="grid h-[60vh] place-items-center bg-[#050208]">
      <h1
        className="font-mono text-6xl md:text-8xl font-black uppercase tracking-tight text-[#fff]"
        style={{
          textShadow:
            "0 0 4px #fff,0 0 12px #ff00c8,0 0 28px #ff00c8,0 0 56px #ff00c8",
          animation: "flick 3s infinite",
        }}
      >
        Neon
      </h1>
      <style>{`@keyframes flick{0%,100%{opacity:1}42%{opacity:1}43%{opacity:.3}44%{opacity:1}70%{opacity:1}72%{opacity:.6}73%{opacity:1}}`}</style>
    </div>
  );
}