import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useUserTier } from "@/hooks/use-user-tier";
import logo from "@/assets/dm-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";


export function SiteHeader() {
  const { isAdmin, isPlus, loading } = useUserTier();
  const { user } = useAuth();
  const navigate = useNavigate();

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
            Design Master <span className="text-neon">280</span>
          </Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">
            Planos
          </Link>
          {(isAdmin || isPlus) && (
            <Link to="/agent" className="hover:text-foreground transition-colors">
              Agent <span className="text-neon-purple">AI</span>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/users" className="hover:text-foreground transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {!loading && user ? (
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