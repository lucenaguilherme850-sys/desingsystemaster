import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type Tier = "anon" | "free" | "pro" | "plus" | "admin";

export function useUserTier(): { tier: Tier; loading: boolean; isPro: boolean; isPlus: boolean; isAdmin: boolean } {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user,
    staleTime: 0, // Disable cache to force fresh checks when debugging access
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .order('role', { ascending: true }); // Ensure deterministic order for stable tiers
      if (error) {
        console.error("Error fetching user roles:", error);
        return [] as { role: string }[];
      }
      return (data ?? []) as unknown as { role: string }[];
    },
  });

  const loading = authLoading || (!!user && isLoading);
  
  const roles = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.map((r) => r.role.toLowerCase().trim()));
  }, [data]);

  const isAdmin = roles.has("admin");
  const isPlus = isAdmin || roles.has("plus") || roles.has("agent_plus") || roles.has("agent plus");
  const isPro = isPlus || roles.has("pro");

  // Log roles for debugging in browser console
  useEffect(() => {
    if (user && !loading) {
      console.debug(`[useUserTier] User: ${user.email}, Roles in DB:`, Array.from(roles), { isAdmin, isPlus, isPro });
    }
  }, [user, roles, isAdmin, isPlus, isPro, loading]);

  if (!user) return { tier: "anon", loading, isPro: false, isPlus: false, isAdmin: false };
  
  const tier: Tier = isAdmin ? "admin" : isPlus ? "plus" : isPro ? "pro" : "free";
  
  return { tier, loading, isPro, isPlus, isAdmin };
}