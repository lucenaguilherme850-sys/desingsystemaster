import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "@/lib/admin.functions";
import logo from "@/assets/dm-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";

export function SiteHeader() {
  const check = useServerFn(isAdmin);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: admin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => check().catch(() => false),
    staleTime: 60_000,
    retry: false,
    enabled: !!user,
  });
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo.url} alt="Design Master" className="size-9 rounded-md object-contain" />
          <span className="text-[15px] font-semibold tracking-tight uppercase">
            Design<span className="text-neon-purple"> Master</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Effects</Link>
          <Link to="/animmaster" className="hover:text-foreground transition-colors">
            Animmaster <span className="text-neon">280</span>
          </Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">
            Planos
          </Link>
          {admin && (
            <>
              <Link to="/agent" className="hover:text-foreground transition-colors">
                Agent <span className="text-neon-purple">AI</span>
              </Link>
              <Link to="/admin/users" className="hover:text-foreground transition-colors">
                Admin
              </Link>
            </>
          )}
        </nav>

        {user ? (
          <button
            onClick={logout}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-neon hover:text-neon"
          >
            Sair
          </button>
        ) : (
          <Link
            to="/pricing"
            className="glow-cyan rounded-full bg-neon px-5 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            Unlock PRO
          </Link>
        )}
      </div>
    </header>
  );
}