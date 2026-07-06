import { useEffect, useRef } from "react";
import { IG } from "./_ig-tokens";

const NOTES = [
  { tag: "principle", title: "Nothing appears without cause" },
  { tag: "method", title: "Reveal what enters the frame" },
  { tag: "detail", title: "80ms stagger per column" },
  { tag: "detail", title: "Cubic-bezier(.22, 1, .36, 1)" },
  { tag: "principle", title: "Never reveal twice" },
  { tag: "method", title: "Observe once, unobserve after" },
  { tag: "detail", title: "Threshold 0.3 · rootMargin 0" },
  { tag: "coda", title: "The scroll is the score" },
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
    <div
      ref={rootRef}
      className="h-[400px] w-full overflow-auto rounded-md border p-8"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        ▽ Scroll — intersection reveal
      </div>
      {NOTES.map((n, i) => (
        <div
          key={i}
          data-reveal
          className="mb-5 flex items-center gap-5 opacity-0 translate-y-8"
          style={{
            transition: `opacity 900ms ${IG.easeOut}, transform 900ms ${IG.easeOut}`,
            transitionDelay: `${(i % 3) * 100}ms`,
          }}
        >
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-sm border font-mono text-[10px] uppercase tracking-widest"
            style={{ borderColor: IG.rule, color: IG.accent }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="flex-1 border-b pb-4" style={{ borderColor: IG.rule }}>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: IG.inkFaint }}
            >
              {n.tag}
            </div>
            <div className="font-serif text-2xl italic" style={{ color: IG.ink }}>
              {n.title}
            </div>
          </div>
        </div>
      ))}
      <style>{`.is-in{opacity:1 !important;transform:none !important}`}</style>
    </div>
  );
}