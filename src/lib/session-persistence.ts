import { supabase } from "@/integrations/supabase/client";

/**
 * "Lembrar de mim".
 *
 * O Supabase persiste a sessão em storage local por padrão. Quando o usuário
 * NÃO marca "lembrar de mim", tratamos a sessão como efêmera: gravamos um
 * marcador em `sessionStorage` (que morre junto com a aba) e, no próximo
 * carregamento sem esse marcador, encerramos a sessão localmente.
 */
const FLAG = "dm.session.ephemeral";
const ALIVE = "dm.session.alive";

export function applyRememberMe(remember: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (remember) {
      localStorage.removeItem(FLAG);
      sessionStorage.removeItem(ALIVE);
    } else {
      localStorage.setItem(FLAG, "1");
      sessionStorage.setItem(ALIVE, "1");
    }
  } catch {
    /* storage indisponível — ignora */
  }
}

/**
 * Executado no boot do app: se a sessão foi marcada como efêmera e a aba
 * original foi fechada, desloga localmente.
 */
export async function enforceSessionPolicy(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(FLAG) !== "1") return;
    if (sessionStorage.getItem(ALIVE) === "1") return;
    localStorage.removeItem(FLAG);
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    /* nunca bloqueia o boot */
  }
}
