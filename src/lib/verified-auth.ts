import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Camada de autorização acima da autenticação.
 *
 * Regras aplicadas no servidor (não confiáveis no cliente):
 * 1. O token precisa ser válido (herdado de `requireSupabaseAuth`).
 * 2. O e-mail precisa estar confirmado — conta criada com endereço inexistente
 *    nunca chega a este ponto porque nunca recebe o link de confirmação.
 * 3. A conta não pode estar bloqueada pelo painel administrativo.
 */
export const requireVerifiedUser = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Unauthorized: invalid session");
    if (!data.user.email_confirmed_at) throw new Error("email_not_confirmed");

    const { data: blocked, error: blockedError } = await supabase.rpc("is_account_blocked", {
      _user_id: userId,
    });
    // Falha fechada: não autorize operações quando o status de bloqueio não puder ser verificado.
    if (blockedError || typeof blocked !== "boolean") throw new Error("account_status_unavailable");
    if (blocked) throw new Error("account_blocked");

    return next({ context: { user: data.user } });
  });
