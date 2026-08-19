import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export type Tier = "anon" | "free" | "pro" | "plus" | "admin";

export function useUserTier(): { tier: Tier; loading: boolean; isPro: boolean; isPlus: boolean; isAdmin: boolean; user: any } {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .order("role", { ascending: true });
      if (error) {
        console.error("Error fetching user roles:", error);
        return [] as { role: string }[];
      }
      return (data ?? []) as unknown as { role: string }[];
    },
  });

  // Realtime subscription for roles (unique channel per mount to avoid
  // "cannot add postgres_changes callbacks after subscribe()" crashes)
  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase.channel(
        `user-roles-${userId}-${Math.random().toString(36).slice(2)}`,
      );
      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_roles",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            qc.invalidateQueries({ queryKey: ["user-roles", userId] });
          },
        )
        .subscribe();
    } catch (err) {
      // Realtime is an optimization only — never break the page for it.
      console.warn("[useUserTier] realtime unavailable:", err);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* noop */
        }
      }
    };
  }, [user?.id, qc]);

  const loading = authLoading || (!!user && isLoading);
  
  const roles = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.map((r) => r.role.toLowerCase().trim()));
  }, [data]);

  const isAdmin = roles.has("admin");
  const isPlus = isAdmin || roles.has("plus") || roles.has("agent_plus") || roles.has("agent plus");
  const isPro = isAdmin || isPlus || roles.has("pro");

  // Log roles for debugging in browser console
  useEffect(() => {
    if (user && !loading) {
      console.debug(`[useUserTier] User: ${user.email}, Roles in DB:`, Array.from(roles), { isAdmin, isPlus, isPro });
    }
  }, [user, roles, isAdmin, isPlus, isPro, loading]);

  if (!user) return { tier: "anon", loading, isPro: false, isPlus: false, isAdmin: false, user: null };
  
  const tier: Tier = isAdmin ? "admin" : isPlus ? "plus" : isPro ? "pro" : "free";
  
  return { tier, loading, isPro, isPlus, isAdmin, user };
}
