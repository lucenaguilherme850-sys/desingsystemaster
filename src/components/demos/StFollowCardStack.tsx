import { useEffect, useState } from "react";
import { FA } from "./_followart-tokens";

// FOLLOW.ART "One Card" fan: perspective stack of black artist cards that
// fan out on hover and drift on load, mirroring the homepage hero.
const CARDS = [
  { name: "Cassandra Zampini", role: "Artist", loc: "NY" },
  { name: "Maria Isserlis",   role: "Curator", loc: "Berlin" },
  { name: "Venus Nwaokoro",   role: "Artist",  loc: "CA · Ajax" },
  { name: "Ilya Petrov",      role: "Painter", loc: "Lisbon" },
  { name: "Ana Sørensen",     role: "Sculptor",loc: "CPH" },
];

export function StFollowCardStack() {
  const [hover, setHover] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEntered(true), 120); return () => clearTimeout(t); }, []);

  return (
    <div className="relative min-h-[520px] overflow-hidden grid place-items-center" style={{ background: FA.orange }}>
      <div
        className="relative"
        style={{ perspective: 1400, width: 720, height: 380 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {CARDS.map((c, i) => {
          const mid = (CARDS.length - 1) / 2;
          const offset = i - mid;
          const fan = hover ? 22 : 6;
          const spread = hover ? 150 : 40;
          return (
            <div
              key={c.name}
              className="absolute left-1/2 top-1/2"
              style={{
                width: 240, height: 340,
                marginLeft: -120, marginTop: -170,
                background: FA.black,
                borderRadius: 6,
                boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55)",
                transform: entered
                  ? `translateX(${offset * spread}px) translateY(${Math.abs(offset) * 6}px) rotateZ(${offset * fan * 0.5}deg) rotateY(${offset * -8}deg)`
                  : `translateY(120px) rotateX(60deg)`,
                opacity: entered ? 1 : 0,
                transformStyle: "preserve-3d",
                transition: `transform 1100ms ${FA.easeOut} ${i * 60}ms, opacity 700ms ease ${i * 60}ms`,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              <div className="flex h-full flex-col p-5" style={{ color: FA.white, fontFamily: FA.body }}>
                <div className="flex-1">
                  <div style={{ fontFamily: FA.display, fontSize: 30, lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.01em" }}>
                    {c.name.split(" ").map((w, j) => <div key={j}>{w}</div>)}
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between text-[11px]" style={{ color: FA.ink60 }}>
                  <div>
                    <div style={{ color: FA.white }}>{c.role}</div>
                    <div>{c.loc}</div>
                  </div>
                  <div style={{ color: FA.orange, fontWeight: 700 }}>→</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-6 left-6" style={{ color: FA.white, fontFamily: FA.body, fontSize: 22, maxWidth: 420, lineHeight: 1.2 }}>
        One Card.<br />
        <span style={{ color: FA.ink60 }}>Share it. Be noticed. Be supported.</span>
      </div>
    </div>
  );
}