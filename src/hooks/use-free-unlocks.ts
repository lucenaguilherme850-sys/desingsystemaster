import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { claimFreeUnlock } from "@/lib/free-unlocks.functions";
import { getDeviceId } from "@/lib/device-id";
import { useAuth } from "./use-auth";

export const FREE_UNLOCK_QUOTA = 3;

export type UnlockRow = { slug: string; expires_at: string };

/** Mensagens amigáveis para os erros do servidor. */
export function unlockErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  if (raw.includes("device_limit"))
    return "Este dispositivo já usou as amostras grátis em outras contas.";
  if (raw.includes("quota_exceeded"))
    return "Você já usou suas 3 amostras grátis.";
  if (raw.includes("not_authenticated") || raw.includes("Unauthorized"))
    return "Faça login para liberar uma amostra.";
  if (raw.includes("email_not_confirmed"))
    return "Confirme seu e-mail para liberar as amostras grátis.";
  if (raw.includes("disposable_email_not_allowed"))
    return "E-mails temporários não podem receber amostras grátis. Use um e-mail permanente.";
  return "Não foi possível liberar agora. Tente novamente.";
}

/**
 * Amostras grátis: todo usuário cadastrado pode liberar 3 componentes,
 * cada um válido por 7 dias.
 */
export function useFreeUnlocks() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const claim = useServerFn(claimFreeUnlock);
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
      return claim({ data: { slug, deviceHash: getDeviceId() } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    loading: authLoading || (!!user && isLoading),
    remaining,
    used,
    quota: FREE_UNLOCK_QUOTA,
    isAuthenticated: !!user,
    hasUnlocked: (slug: string) => active.some((r) => r.slug === slug),
    expiresAt: (slug: string) =>
      active.find((r) => r.slug === slug)?.expires_at ?? null,
    unlock,
  };
}
