export default function Text14Shine() {
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <h1
        className="font-mono text-6xl md:text-8xl font-black uppercase tracking-tight bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#3a3a3a 0%,#3a3a3a 40%,#fff 50%,#3a3a3a 60%,#3a3a3a 100%)",
          backgroundSize: "200% 100%",
          animation: "shine 2.4s linear infinite",
        }}
      >
        Metallic
      </h1>
      <style>{`@keyframes shine{0%{background-position:200% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}