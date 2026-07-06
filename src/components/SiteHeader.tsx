import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Plus, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid size-7 place-items-center rounded-md border border-border bg-card">
            <Layers className="size-4 text-neon" />
          </span>
          <span className="font-mono text-sm tracking-tight">
            motion<span className="text-neon">.</span>library
          </span>
        </Link>

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
            <Button asChild variant="ghost" size="sm" className="font-mono text-xs">
              <Link to="/auth">
                <LogIn className="size-4" /> Sign in
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}