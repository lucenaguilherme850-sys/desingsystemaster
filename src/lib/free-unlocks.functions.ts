import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireVerifiedUser } from "@/lib/verified-auth";
import { isDisposableEmail } from "@/lib/email-risk";

const schema = z.object({
  slug: z.string().min(1).max(200),
  deviceHash: z.string().min(1).max(120),
});

/** Máximo de contas distintas por dispositivo com direito a amostras. */
export const MAX_ACCOUNTS_PER_DEVICE = 2;

export const claimFreeUnlock = createServerFn({ method: "POST" })
  .middleware([requireVerifiedUser])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 0. Verifica se o e-mail está confirmado.
    // Usamos context.supabase que já está autenticado como o usuário.
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Se não houver erro mas o e-mail não estiver confirmado, bloqueamos apenas a liberação.
    if (user && !user.email_confirmed_at) {
       throw new Error("email_not_confirmed");
    }
    
    if (userError) {
      throw new Error("auth_failed");
    }
    if (user && isDisposableEmail(user.email)) {
      throw new Error("disposable_email_not_allowed");
    }




    // 1. Vincula o dispositivo à conta (idempotente).
    const { error: devError } = await supabase
      .from("device_accounts")
      .upsert(
        { device_hash: data.deviceHash, user_id: userId },
        { onConflict: "device_hash,user_id", ignoreDuplicates: true },
      );
    if (devError) throw new Error("device_register_failed");

    // 2. Bloqueia múltiplas contas no mesmo dispositivo.
    const { data: count, error: countError } = await supabase.rpc(
      "device_user_count",
      { _device_hash: data.deviceHash },
    );
    if (countError) throw new Error("device_check_failed");
    if ((count ?? 0) > MAX_ACCOUNTS_PER_DEVICE) throw new Error("device_limit");

    // 3. Aplica a cota de uma amostra no servidor antes de inserir.
    const { count: usedCount, error: usedError } = await supabase
      .from("component_unlocks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (usedError) throw new Error("quota_check_failed");
    if ((usedCount ?? 0) >= 1) throw new Error("quota_exceeded");

    // 4. Cria a única amostra grátis; validade de 7 dias continua sendo aplicada pelo banco.
    const { error } = await supabase
      .from("component_unlocks")
      .insert({ user_id: userId, slug: data.slug });
    if (error) {
      throw new Error(
        error.message.includes("free_unlock_quota_exceeded")
          ? "quota_exceeded"
          : "unlock_failed",
      );
    }
    return { ok: true as const };
  });
