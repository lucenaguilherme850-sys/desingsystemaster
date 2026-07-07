export default function Text21LineDraw() {
  return (
    <div className="grid h-[60vh] place-items-center bg-[#07090f]">
      <svg viewBox="0 0 600 160" className="w-[80vw] max-w-3xl">
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          className="font-mono"
          style={{
            fontSize: 120,
            fontWeight: 900,
            fill: "transparent",
            stroke: "hsl(var(--neon))",
            strokeWidth: 2,
            strokeDasharray: 1200,
            strokeDashoffset: 1200,
            animation: "draw 3.2s ease-in-out infinite",
          }}
        >
          DRAW
        </text>
        <style>{`@keyframes draw{0%{stroke-dashoffset:1200;fill:transparent}60%{stroke-dashoffset:0;fill:transparent}100%{stroke-dashoffset:0;fill:hsl(var(--neon))}}`}</style>
      </svg>
    </div>
  );
}