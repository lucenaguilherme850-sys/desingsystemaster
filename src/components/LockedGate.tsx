import { Link } from "@tanstack/react-router";
import { Lock, Gift, Loader2, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useUserTier } from "@/hooks/use-user-tier";
import { useFreeUnlocks, unlockErrorMessage } from "@/hooks/use-free-unlocks";

type Requires = "pro" | "plus";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Envelopa conteúdo premium. Ordem de checagem:
 * 1. Admin / PRO / Agent Plus  -> acesso permanente, ignora amostras.
 * 2. Amostra grátis ativa do componente -> acesso temporário (7 dias).
 * 3. Cota de amostras disponível -> botão "Liberar amostra grátis".
 * 4. Sem cota -> CTA de planos.
 */
export function LockedGate({
  children,
  requires = "pro",
  label,
  slug,
}: {
  children: ReactNode;
  requires?: Requires;
  label?: string;
  /** Necessário para permitir a liberação por amostra grátis. */
  slug?: string;
}) {
  const { isPro, isPlus, isAdmin, loading } = useUserTier();
  const {
    loading: unlocksLoading,
    remaining,
    quota,
    isAuthenticated,
    hasUnlocked,
    expiresAt,
    unlock,
  } = useFreeUnlocks();

  if (loading || unlocksLoading) return null;

  // 1. Planos pagos e admin passam sempre, antes de qualquer lógica de amostra.
  const paidAccess = isAdmin || (requires === "pro" ? isPro : isPlus);
  if (paidAccess) return <>{children}</>;

  // 2. Amostra ativa para este componente.
  const sampleActive = !!slug && hasUnlocked(slug);
  if (sampleActive) {
    const exp = slug ? expiresAt(slug) : null;
    return (
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-4 py-1.5 text-xs font-semibold text-neon">
          <Clock className="size-3.5" />
          Amostra grátis ativa
          {exp && <span className="text-foreground/80">· expira em {formatDate(exp)}</span>}
        </div>
        {children}
      </div>
    );
  }

  const planName = requires === "plus" ? "Agent Plus" : "PRO";
  const canSample = isAuthenticated && !!slug && remaining > 0;
  const pending = unlock.isPending;

  const handleUnlock = () => {
    if (!slug) return;
    toast.loading("Liberando amostra...", { id: "free-unlock" });
    unlock.mutate(slug, {
      onSuccess: () =>
        toast.success("Componente liberado por 7 dias!", { id: "free-unlock" }),
      onError: (err) =>
        toast.error(unlockErrorMessage(err), { id: "free-unlock" }),
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neon-purple/40 bg-card/60">
      <div className="pointer-events-none select-none opacity-40 blur-[3px] max-h-[420px] overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
        <div className="max-w-md rounded-2xl border border-neon/30 bg-card p-6 text-center shadow-[0_0_60px_oklch(0.6_0.25_300/25%)]">
          <div className="mx-auto grid size-10 place-items-center rounded-full border border-neon/40 bg-neon/10 text-neon">
            <Lock className="size-4" />
          </div>
          <h3 className="mt-3 text-lg font-bold uppercase tracking-tight">
            {label ?? "Conteúdo bloqueado"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            O código-fonte, prompt mestre e arquivos completos estão disponíveis
            apenas no plano <span className="font-semibold text-foreground">{planName}</span>.
          </p>

          {canSample && (
            <button
              type="button"
              onClick={handleUnlock}
              disabled={pending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-neon bg-neon/10 px-6 py-2.5 text-sm font-semibold text-neon transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Gift className="size-4" />
              )}
              {pending
                ? "Liberando..."
                : `Liberar amostra grátis (${remaining} de ${quota} restantes)`}
            </button>
          )}

          {isAuthenticated && !canSample && (
            <p className="mt-4 text-xs text-muted-foreground">
              Suas {quota} amostras grátis já foram usadas ou expiraram.
            </p>
          )}

          {!isAuthenticated && (
            <Link
              to="/auth"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-neon/40 px-6 py-2.5 text-sm font-semibold text-neon"
            >
              Criar conta e ganhar 3 amostras grátis
            </Link>
          )}

          <Link
            to="/pricing"
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-neon px-6 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            Ver planos
          </Link>
        </div>
      </div>
    </div>
  );
}
