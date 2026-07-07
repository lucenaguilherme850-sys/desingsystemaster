export default function Text18Mask() {
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div
        className="font-mono text-6xl md:text-9xl font-black uppercase tracking-tight bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "conic-gradient(from 0deg at 50% 50%, #ff00c8, #00e5ff, #ff00c8)",
          animation: "spinBg 6s linear infinite",
        }}
      >
        MASKED
      </div>
      <style>{`@keyframes spinBg{to{filter:hue-rotate(360deg)}}`}</style>
    </div>
  );
}