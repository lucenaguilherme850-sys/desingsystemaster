import { supabase } from "@/integrations/supabase/client";

/**
 * Tipos de evento de segurança registrados na conta.
 * Mantidos como união literal para evitar strings soltas espalhadas pelo código.
 */
export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "signup"
  | "logout"
  | "password_reset_requested"
  | "password_changed"
  | "mfa_enrolled"
  | "mfa_disabled"
  | "sessions_revoked"
  | "role_granted"
  | "role_revoked";

export const SECURITY_EVENT_LABEL: Record<SecurityEventType, string> = {
  login_success: "Login realizado",
  login_failed: "Falha de login",
  signup: "Conta criada",
  logout: "Sessão encerrada",
  password_reset_requested: "Recuperação de senha solicitada",
  password_changed: "Senha alterada",
  mfa_enrolled: "2FA ativado",
  mfa_disabled: "2FA desativado",
  sessions_revoked: "Outras sessões encerradas",
  role_granted: "Permissão concedida",
  role_revoked: "Permissão removida",
};

/**
 * Registra um evento de segurança da conta autenticada.
 *
 * Regras importantes:
 * - Só grava quando existe sessão (a policy exige `auth.uid() = user_id`).
 * - NUNCA recebe senha, token ou qualquer segredo em `details`.
 * - Falhas de log jamais interrompem o fluxo do usuário.
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: eventType,
      email: user.email ?? null,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null,
      details: sanitizeDetails(details),
    });
  } catch {
    /* logging é best-effort — nunca quebra a experiência */
  }
}

/** Remove chaves potencialmente sensíveis antes de persistir. */
function sanitizeDetails(details: Record<string, unknown>): Record<string, string | number | boolean | null> {
  const BLOCKED = /pass|senha|token|secret|key|otp|code/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(details)) {
    if (BLOCKED.test(k)) continue;
    if (typeof v === "string" && v.length > 300) continue;
    out[k] = v;
  }
  return out;
}
