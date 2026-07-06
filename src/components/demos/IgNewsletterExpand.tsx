import { useState } from "react";
export function IgNewsletterExpand() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="grid h-[300px] w-full place-items-center rounded-md border border-border bg-background p-6">
      <div
        className="relative overflow-hidden rounded-full border border-border bg-card transition-all duration-500"
        style={{ width: open ? 380 : 160, transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
      >
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="w-full px-5 py-3 font-mono text-xs uppercase tracking-widest text-foreground"
          >
            subscribe →
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
              className="flex-1 bg-transparent px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button className="rounded-full bg-primary px-4 py-2 font-mono text-[10px] uppercase text-primary-foreground">
              {sent ? "✓" : "send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}