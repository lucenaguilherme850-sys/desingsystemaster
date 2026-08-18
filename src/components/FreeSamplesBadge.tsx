import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserTier } from "@/hooks/use-user-tier";
import { useFreeUnlocks } from "@/hooks/use-free-unlocks";

/** Contador de amostras grátis restantes. Some para planos pagos/admin. */
export function FreeSamplesBadge({ className }: { className?: string }) {
  const { isPro, isPlus, isAdmin, loading } = useUserTier();
  const { loading: unlocksLoading, remaining, quota, isAuthenticated } = useFreeUnlocks();

  if (loading || unlocksLoading || !isAuthenticated) return null;
  if (isAdmin || isPro || isPlus) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs font-semibold text-neon",
        className,
      )}
    >
      <Gift className="size-3.5" />
      {remaining} de {quota} amostras grátis
    </span>
  );
}
