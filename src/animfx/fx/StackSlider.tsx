import { useState } from "react";

const cards = [
  { title: "Neon", color: "from-[#00e5ff] to-[#0066ff]" },
  { title: "Aurora", color: "from-[#ff00c8] to-[#ff5b00]" },
  { title: "Prism", color: "from-[#a4ff00] to-[#00c8b4]" },
  { title: "Vertex", color: "from-[#7a5cff] to-[#ff00a8]" },
];

export default function StackSlider() {
  const [i, setI] = useState(0);
  const next = () => setI((v) => (v + 1) % cards.length);
  return (
    <div className="grid min-h-[70vh] place-items-center bg-background p-10">
      <div className="relative h-96 w-72">
        {cards.map((c, idx) => {
          const offset = (idx - i + cards.length) % cards.length;
          const active = offset === 0;
          return (
            <div
              key={c.title}
              onClick={next}
              className={`absolute inset-0 cursor-pointer rounded-2xl bg-gradient-to-br ${c.color} p-6 shadow-2xl transition-all duration-500`}
              style={{
                transform: `translate(${offset * 12}px, ${offset * -12}px) rotate(${offset * 2}deg) scale(${1 - offset * 0.05})`,
                zIndex: cards.length - offset,
                opacity: offset > 2 ? 0 : 1,
              }}
            >
              <div className="font-mono text-xs uppercase tracking-widest text-black/70">#{idx + 1}</div>
              <div className="mt-8 text-5xl font-black uppercase text-black mix-blend-overlay">{c.title}</div>
              {active && (
                <div className="absolute bottom-6 left-6 font-mono text-xs uppercase tracking-widest text-black/80">click to shuffle →</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}