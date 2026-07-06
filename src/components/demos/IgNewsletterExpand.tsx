import { useState } from "react";
import { IG } from "./_ig-tokens";

export function IgNewsletterExpand() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div
      className="relative grid h-[300px] w-full place-items-center overflow-hidden rounded-md border p-6"
      style={{ background: IG.bg, borderColor: IG.rule, color: IG.ink }}
    >
      <div
        className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: IG.inkFaint }}
      >
        Dispatch — 001
      </div>
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="text-center font-serif text-3xl italic leading-tight" style={{ color: IG.ink }}>
          A monthly letter <br />
          on <span style={{ color: IG.accent }}>craft &amp; motion</span>.
        </div>
        <div
          className="relative overflow-hidden rounded-full border"
          style={{
            width: open ? 380 : 180,
            borderColor: open ? IG.ink : IG.rule,
            background: IG.surface,
            transition: `width 900ms ${IG.ease}, border-color 900ms ${IG.ease}`,
          }}
        >
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="w-full px-6 py-3 font-mono text-xs uppercase tracking-[0.3em]"
              style={{ color: IG.ink }}
            >
              subscribe
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
                className="flex-1 bg-transparent px-3 py-2 font-mono text-xs outline-none"
                style={{ color: IG.ink }}
              />
              <button
                className="rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{
                  background: sent ? IG.ink : IG.accent,
                  color: sent ? IG.bg : IG.ink,
                  transition: `background 400ms ${IG.ease}`,
                }}
              >
                {sent ? "sent" : "join"}
              </button>
            </form>
          )}
        </div>
        <div
          className="font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: IG.inkFaint }}
        >
          2 431 readers · no spam, ever
        </div>
      </div>
    </div>
  );
}