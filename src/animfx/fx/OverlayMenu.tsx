import { useState } from "react";

const links = ["Work", "Studio", "Journal", "Contact"];

export default function OverlayMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden bg-[#07090f]">
      <div className="flex items-center justify-between px-8 py-6">
        <div className="font-mono text-xs uppercase tracking-widest text-neon">overlay menu</div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-neon/60 px-5 py-2 font-mono text-xs uppercase tracking-widest text-neon"
        >
          {open ? "close" : "menu"}
        </button>
      </div>
      <div
        className="absolute inset-0 z-20 origin-top bg-neon text-background transition-transform duration-700"
        style={{ transform: open ? "translateY(0)" : "translateY(-100%)", transitionTimingFunction: "cubic-bezier(.7,.0,.2,1)" }}
      >
        <div className="flex h-full flex-col justify-center gap-4 px-16">
          {links.map((l, i) => (
            <a
              key={l}
              className="block text-6xl md:text-8xl font-black uppercase leading-none"
              style={{
                transform: open ? "translateY(0)" : "translateY(40px)",
                opacity: open ? 1 : 0,
                transition: `all .6s cubic-bezier(.2,.8,.2,1) ${300 + i * 90}ms`,
              }}
            >
              {l}
            </a>
          ))}
          <div
            className="mt-8 flex justify-end px-16 pr-0"
          >
            <button onClick={() => setOpen(false)} className="rounded-full border border-background px-5 py-2 font-mono text-xs uppercase tracking-widest">close</button>
          </div>
        </div>
      </div>
      <div className="grid h-[calc(70vh-88px)] place-items-center px-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase">click menu</h2>
          <p className="mt-2 text-muted-foreground">full-screen overlay reveal</p>
        </div>
      </div>
    </div>
  );
}