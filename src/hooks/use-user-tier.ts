import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type Tier = "anon" | "free" | "pro" | "plus" | "admin";

export function useUserTier(): { tier: Tier; loading: boolean; isPro: boolean; isPlus: boolean; isAdmin: boolean } {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) return [] as { role: string }[];
      return (data ?? []) as unknown as { role: string }[];
    },
  });
  const loading = authLoading || (!!user && isLoading);
  if (!user) return { tier: "anon", loading, isPro: false, isPlus: false, isAdmin: false };
  const roles = new Set((data ?? []).map((r) => r.role));
  const isAdmin = roles.has("admin");
  const isPlus = isAdmin || roles.has("plus");
  const isPro = isPlus || roles.has("pro");
  const tier: Tier = isAdmin ? "admin" : isPlus ? "plus" : isPro ? "pro" : "free";
  return { tier, loading, isPro, isPlus, isAdmin };
}
