import { useState } from "react";
import { palette } from "./palette";

export default function MenuVariants({ seed = 1 }: { seed?: number }) {
  const kind = seed % 4;
  const [c1, c2, bg] = palette(seed);
  if (kind === 0) return <OverlayFull c1={c1} c2={c2} bg={bg} />;
  if (kind === 1) return <SideDrawer c1={c1} c2={c2} bg={bg} />;
  if (kind === 2) return <SplitPanels c1={c1} c2={c2} bg={bg} />;
  return <RadialMenu c1={c1} c2={c2} bg={bg} />;
}

const LINKS = ["Work", "Studio", "Journal", "Contact"];

function OverlayFull({ c1, bg }: { c1: string; c2: string; bg: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-[70vh] overflow-hidden" style={{ background: bg }}>
      <Bar open={open} setOpen={setOpen} accent={c1} />
      <div className="absolute inset-0 z-20 origin-top" style={{ background: c1, transform: open ? "translateY(0)" : "translateY(-100%)", transition: "transform .7s cubic-bezier(.7,0,.2,1)" }}>
        <ul className="flex h-full flex-col justify-center gap-4 px-16">
          {LINKS.map((l, i) => <li key={l} className="text-6xl md:text-8xl font-black uppercase text-black" style={{ transform: open ? "translateY(0)" : "translateY(40px)", opacity: open ? 1 : 0, transition: `all .6s ${300 + i * 90}ms` }}>{l}</li>)}
        </ul>
      </div>
    </div>
  );
}

function SideDrawer({ c1, bg }: { c1: string; c2: string; bg: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-[70vh] overflow-hidden" style={{ background: bg }}>
      <Bar open={open} setOpen={setOpen} accent={c1} />
      <div className="absolute right-0 top-0 z-20 h-full w-[70%] max-w-md p-10" style={{ background: c1, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform .6s cubic-bezier(.7,0,.2,1)" }}>
        <ul className="mt-16 space-y-6">{LINKS.map((l) => <li key={l} className="text-4xl font-black uppercase text-black">{l}</li>)}</ul>
      </div>
    </div>
  );
}

function SplitPanels({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-[70vh] overflow-hidden" style={{ background: bg }}>
      <Bar open={open} setOpen={setOpen} accent={c1} />
      <div className="absolute inset-x-0 top-0 z-20 h-1/2" style={{ background: c1, transform: open ? "translateY(0)" : "translateY(-100%)", transition: "transform .7s" }} />
      <div className="absolute inset-x-0 bottom-0 z-20 h-1/2" style={{ background: c2, transform: open ? "translateY(0)" : "translateY(100%)", transition: "transform .7s" }} />
      {open && (
        <ul className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
          {LINKS.map((l, i) => <li key={l} className="text-5xl md:text-7xl font-black uppercase text-white" style={{ transform: `translateY(${i * 60 - 90}px)` }}>{l}</li>)}
        </ul>
      )}
    </div>
  );
}

function RadialMenu({ c1, c2, bg }: { c1: string; c2: string; bg: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden" style={{ background: bg }}>
      <button onClick={() => setOpen((v) => !v)} className="relative z-30 grid h-20 w-20 place-items-center rounded-full font-mono text-xs uppercase text-black" style={{ background: c1 }}>
        {open ? "close" : "menu"}
      </button>
      {LINKS.map((l, i) => {
        const a = (i / LINKS.length) * Math.PI * 2 - Math.PI / 2;
        const r = open ? 180 : 0;
        return (
          <div key={l} className="absolute grid h-16 w-16 place-items-center rounded-full font-mono text-[10px] uppercase text-black transition-transform duration-500"
               style={{ background: i % 2 ? c1 : c2, transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px)`, opacity: open ? 1 : 0 }}>{l}</div>
        );
      })}
    </div>
  );
}

function Bar({ open, setOpen, accent }: { open: boolean; setOpen: (v: boolean) => void; accent: string }) {
  return (
    <div className="relative z-30 flex items-center justify-between px-8 py-6">
      <div className="font-mono text-xs uppercase tracking-widest text-white">Menu</div>
      <button onClick={() => setOpen(!open)} className="rounded-full border px-5 py-2 font-mono text-xs uppercase tracking-widest" style={{ borderColor: accent, color: open ? "black" : accent, background: open ? accent : "transparent" }}>
        {open ? "close" : "open"}
      </button>
    </div>
  );
}