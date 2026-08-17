import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export const FREE_UNLOCK_QUOTA = 3;

export type UnlockRow = { slug: string; expires_at: string };

/**
 * Amostras grátis: todo usuário cadastrado pode liberar 3 componentes,
 * cada um válido por 7 dias.
 */
export function useFreeUnlocks() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const key = ["component-unlocks", user?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    staleTime: 0,
    queryFn: async (): Promise<UnlockRow[]> => {
      const { data, error } = await supabase
        .from("component_unlocks")
        .select("slug, expires_at")
        .eq("user_id", user!.id);
      if (error) {
        console.error("[useFreeUnlocks]", error);
        return [];
      }
      return (data ?? []) as UnlockRow[];
    },
  });

  const rows = data ?? [];
  const now = Date.now();
  const active = rows.filter((r) => new Date(r.expires_at).getTime() > now);
  const used = rows.length; // cota consome mesmo após expirar
  const remaining = Math.max(0, FREE_UNLOCK_QUOTA - used);

  const unlock = useMutation({
    mutationFn: async (slug: string) => {
      if (!user) throw new Error("not_authenticated");
      const { error } = await supabase
        .from("component_unlocks")
        .insert({ user_id: user.id, slug } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    loading: authLoading || (!!user && isLoading),
    remaining,
    used,
    quota: FREE_UNLOCK_QUOTA,
    hasUnlocked: (slug: string) => active.some((r) => r.slug === slug),
    expiresAt: (slug: string) => active.find((r) => r.slug === slug)?.expires_at ?? null,
    unlock,
  };
}
