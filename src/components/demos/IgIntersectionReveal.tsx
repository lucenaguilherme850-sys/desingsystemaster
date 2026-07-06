import { useEffect, useRef } from "react";
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
    <div ref={rootRef} className="h-[400px] w-full overflow-auto rounded-md border border-border bg-background p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          data-reveal
          className="mb-6 rounded border border-border bg-card p-6 opacity-0 translate-y-8 transition-all duration-700"
          style={{ transitionDelay: `${(i % 3) * 80}ms`, transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
        >
          <div className="font-mono text-[10px] uppercase text-muted-foreground">block · {String(i + 1).padStart(2, "0")}</div>
          <div className="mt-1 font-mono text-2xl text-foreground">reveal on view</div>
        </div>
      ))}
      <style>{`.is-in{opacity:1 !important;transform:none !important}`}</style>
    </div>
  );
}