import { useEffect, useRef } from "react";
const NOTES = [
  { tag: "principle", title: "Nothing appears without cause", bg: "linear-gradient(135deg,#0c4a6e,#0891b2)" },
  { tag: "method", title: "Reveal what enters the frame", bg: "linear-gradient(135deg,#4c1d95,#a855f7)" },
  { tag: "detail", title: "80ms stagger per column", bg: "linear-gradient(135deg,#4a044e,#f472b6)" },
  { tag: "detail", title: "Cubic-bezier(.22, 1, .36, 1)", bg: "linear-gradient(135deg,#052e16,#22c55e)" },
  { tag: "principle", title: "Never reveal twice", bg: "linear-gradient(135deg,#450a0a,#f97316)" },
  { tag: "method", title: "Observe once, unobserve after", bg: "linear-gradient(135deg,#1e1b4b,#3b82f6)" },
  { tag: "detail", title: "Threshold 0.3 · rootMargin 0", bg: "linear-gradient(135deg,#701a75,#e879f9)" },
  { tag: "coda", title: "The scroll is the score", bg: "linear-gradient(135deg,#78350f,#facc15)" },
];
export function IgIntersectionReveal() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { root, threshold: 0.3 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div ref={rootRef} className="h-[400px] w-full overflow-auto rounded-md border border-border bg-[#050510] p-6">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        ▽ scroll · intersection reveal
      </div>
      {NOTES.map((n, i) => (
        <div
          key={i}
          data-reveal
          className="mb-4 flex items-center gap-4 overflow-hidden rounded border border-white/10 p-5 opacity-0 translate-y-8 transition-all duration-700"
          style={{
            background: "rgba(255,255,255,0.02)",
            transitionDelay: `${(i % 3) * 80}ms`,
            transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="h-16 w-16 shrink-0 rounded" style={{ background: n.bg }} />
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              {n.tag} · {String(i + 1).padStart(2, "0")}
            </div>
            <div className="font-serif text-xl italic text-white">{n.title}</div>
          </div>
        </div>
      ))}
      <style>{`.is-in{opacity:1 !important;transform:none !important}`}</style>
    </div>
  );
}