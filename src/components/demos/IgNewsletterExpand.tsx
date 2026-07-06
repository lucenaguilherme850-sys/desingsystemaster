import { useState } from "react";
export function IgNewsletterExpand() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="relative grid h-[300px] w-full place-items-center overflow-hidden rounded-md border border-border bg-[radial-gradient(circle_at_50%_120%,#7c3aed,#1e1b4b_50%,#050510)] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,transparent_95%,rgba(255,255,255,0.04)_95%)] bg-[length:1px_28px]" />
      <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
        ✷ dispatch · 001
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="text-center font-serif text-2xl italic text-white">
          A monthly letter <br />
          on <span className="text-fuchsia-300">craft & motion</span>.
        </div>
        <div
          className="relative overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur transition-all duration-500"
          style={{ width: open ? 380 : 180, transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
        >
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="w-full px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-white"
            >
              subscribe ✧
            </button>
          )}
          {open && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                setTimeout(() => {
                  setSent(false);
                  setOpen(false);
                  setEmail("");
                }, 1500);
              }}
              className="flex items-center gap-1 px-2 py-1"
            >
              <input
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@studio.com"
                className="flex-1 bg-transparent px-3 py-2 font-mono text-xs text-white outline-none placeholder:text-white/40"
              />
              <button
                className="rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white transition-all"
                style={{ background: sent ? "#22c55e" : "linear-gradient(90deg,#a855f7,#22d3ee)" }}
              >
                {sent ? "sent ✓" : "join →"}
              </button>
            </form>
          )}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          2 431 readers · no spam, ever
        </div>
      </div>
    </div>
  );
}