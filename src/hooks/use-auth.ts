import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SESSION_INIT_TIMEOUT_MS = 15000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(() => {
      if (active) {
        // Falha fechada: libera a interface sem presumir que há uma sessão válida.
        setUser(null);
        setLoading(false);
      }
    }, SESSION_INIT_TIMEOUT_MS);

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
      clearTimeout(timeoutId);
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("[Auth] Não foi possível recuperar a sessão:", error.message);
          setUser(null);
        } else {
          setUser(data.session?.user ?? null);
        }
        setLoading(false);
        clearTimeout(timeoutId);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("[Auth] Falha ao inicializar a sessão:", error);
        setUser(null);
        setLoading(false);
        clearTimeout(timeoutId);
      });

    return () => {
      active = false;
      clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}