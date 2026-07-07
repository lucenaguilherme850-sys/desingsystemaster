export default function Text6GradientSweep() {
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <h1
        className="font-mono text-6xl md:text-8xl font-black uppercase tracking-tight bg-clip-text text-transparent"
        style={{
          backgroundImage: "linear-gradient(110deg,#fff 0%,#fff 30%,hsl(var(--neon)) 45%,#fff 60%,#fff 100%)",
          backgroundSize: "300% 100%",
          animation: "sweep 3.5s linear infinite",
        }}
      >
        Gradient
      </h1>
      <style>{`@keyframes sweep{0%{background-position:200% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}