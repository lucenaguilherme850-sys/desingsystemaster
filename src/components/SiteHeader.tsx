import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Plus, Library } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, loading } = useAuth();

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
          <a href="#components" className="hover:text-foreground transition-colors">Components</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>

        <nav className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="font-mono text-xs">
                <Link to="/new">
                  <Plus className="size-4" /> New asset
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs text-muted-foreground"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="size-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <Link to="/auth">
                  <LogIn className="size-4" /> Sign in
                </Link>
              </Button>
              <a
                href="#pricing"
                className="glow-cyan rounded-full bg-neon px-5 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
              >
                Unlock PRO
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}