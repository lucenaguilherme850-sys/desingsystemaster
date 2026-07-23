import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useUserTier } from "@/hooks/use-user-tier";

type Requires = "pro" | "plus";

/**
 * Envelopa conteúdo premium: mostra um preview borrado + CTA de upgrade
 * quando o usuário não tem o tier necessário. Admin sempre passa.
 */
export function LockedGate({
  children,
  requires = "pro",
  label,
}: {
  children: ReactNode;
  requires?: Requires;
  label?: string;
}) {
  const { isPro, isPlus, isAdmin, loading } = useUserTier();
  if (loading) return null;
  const allowed = isAdmin || (requires === "pro" ? isPro : isPlus);
  if (allowed) return <>{children}</>;

  const planName = requires === "plus" ? "Agent Plus" : "PRO";
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
          <Link
            to="/pricing"
            className="mt-5 inline-flex rounded-full bg-neon px-6 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            Ver planos
          </Link>
        </div>
      </div>
    </div>
  );
}
