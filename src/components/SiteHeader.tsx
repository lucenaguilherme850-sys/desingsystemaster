import { Link } from "@tanstack/react-router";
import { Library } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "@/lib/admin.functions";

export function SiteHeader() {
  const check = useServerFn(isAdmin);
  const { data: admin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => check().catch(() => false),
    staleTime: 60_000,
    retry: false,
  });
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid size-8 place-items-center rounded-md border border-border bg-card">
            <Library className="size-4 text-neon" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Motion<span className="text-neon">Lib</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Effects</Link>
          <Link to="/animmaster" className="hover:text-foreground transition-colors">
            Animmaster <span className="text-neon">280</span>
          </Link>
          {admin && (
            <Link to="/agent" className="hover:text-foreground transition-colors">
              Agent <span className="text-neon">AI</span>
            </Link>
          )}
        </nav>

        <a
          href="#pricing"
          className="glow-cyan rounded-full bg-neon px-5 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
        >
          Unlock PRO
        </a>
      </div>
    </header>
  );
}