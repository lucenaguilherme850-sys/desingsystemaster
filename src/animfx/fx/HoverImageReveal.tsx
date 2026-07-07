import { useRef, useState } from "react";

const items = [
  { label: "Kinetic Studio", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=70" },
  { label: "Neon Foundry",  img: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=70" },
  { label: "Prism Objects", img: "https://images.unsplash.com/photo-1618228851290-8d19985d92be?w=800&q=70" },
  { label: "Aurora Systems", img: "https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&q=70" },
];

export default function HoverImageReveal() {
  const [active, setActive] = useState<number | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = imgRef.current;
    if (!el) return;
    const r = el.parentElement!.getBoundingClientRect();
    el.style.transform = `translate3d(${e.clientX - r.left - 160}px, ${e.clientY - r.top - 120}px, 0)`;
  };
  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden bg-background" onMouseMove={onMove}>
      <div ref={imgRef} className="pointer-events-none absolute left-0 top-0 h-60 w-80 overflow-hidden rounded-lg transition-opacity duration-300" style={{ opacity: active !== null ? 1 : 0 }}>
        {items.map((it, i) => (
          <img
            key={it.label}
            src={it.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: active === i ? 1 : 0 }}
          />
        ))}
      </div>
      <ul className="mx-auto max-w-3xl px-6 py-24">
        {items.map((it, i) => (
          <li
            key={it.label}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="cursor-pointer border-b border-border py-8 text-5xl md:text-7xl font-black uppercase transition-colors hover:text-neon"
          >
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}