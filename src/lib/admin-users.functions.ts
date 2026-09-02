import { createServerFn } from "@tanstack/react-start";
import { requireVerifiedUser } from "@/lib/verified-auth";

async function assertAdmin(ctx: { supabase: unknown; userId: string }) {
  // userId comes from a verified bearer token, so it's safe to check the role
  // with the service client (RLS/grants on user_roles can hide the row otherwise).
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin role required");
}

export type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  blocked: boolean;
  block_reason: string | null;
  roles: string[];
};

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireVerifiedUser])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const { data: rolesRows } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: blockRows } = await supabaseAdmin
      .from("account_blocks")
      .select("user_id, reason");
    const rolesByUser = new Map<string, string[]>();
    (rolesRows ?? []).forEach((r: any) => {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    });
    const blocks = new Map<string, string>();
    (blockRows ?? []).forEach((b: any) => blocks.set(b.user_id, b.reason ?? ""));
    return users.users
      .map((u) => ({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        email_confirmed_at: (u.email_confirmed_at as string | undefined) ?? null,
        blocked: blocks.has(u.id),
        block_reason: blocks.get(u.id) ?? null,
        roles: rolesByUser.get(u.id) ?? [],
      }))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  });

/** Cadastro manual feito pelo admin (única forma de conta já confirmada). */
export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireVerifiedUser])
  .inputValidator((d: { email: string; password: string; role?: "pro" | "plus" | "admin" }) => {
    const email = d.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("E-mail inválido");
    if (d.password.length < 8) throw new Error("Senha muito curta");
    return { ...d, email };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // conta autorizada explicitamente pelo administrador
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar usuário");
    if (data.role) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: created.user.id, role: data.role }, { onConflict: "user_id,role" });
    }
    return { ok: true, id: created.user.id };
  });

/** Bloqueia ou desbloqueia uma conta (impede uso das funções sensíveis). */
export const adminSetBlock = createServerFn({ method: "POST" })
  .middleware([requireVerifiedUser])
  .inputValidator((d: { userId: string; blocked: boolean; reason?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("Você não pode bloquear a própria conta");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.blocked) {
      const { error } = await supabaseAdmin.from("account_blocks").upsert(
        {
          user_id: data.userId,
          reason: data.reason?.slice(0, 300) ?? "",
          blocked_by: context.userId,
        },
        { onConflict: "user_id" },
      );
      if (error) throw new Error(error.message);
      // Encerra as sessões ativas da conta bloqueada.
      await supabaseAdmin.auth.admin.signOut(data.userId).catch(() => undefined);
    } else {
      const { error } = await supabaseAdmin
        .from("account_blocks")
        .delete()
        .eq("user_id", data.userId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireVerifiedUser])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("Você não pode excluir a própria conta");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const adminGrantRole = createServerFn({ method: "POST" })
  .middleware([requireVerifiedUser])
  .inputValidator((d: { userId: string; role: "pro" | "plus" | "admin" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRevokeRole = createServerFn({ method: "POST" })
  .middleware([requireVerifiedUser])
  .inputValidator((d: { userId: string; role: "pro" | "plus" | "admin" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
