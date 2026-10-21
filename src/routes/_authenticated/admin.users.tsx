import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Crown, Sparkles, ShieldCheck, X, Search, Ban, Trash2, UserPlus, Loader2, Users, UserCheck, Clock3, ShieldAlert, RefreshCw } from "lucide-react";
import {
  adminGrantRole,
  adminListUsers,
  adminRevokeRole,
  adminCreateUser,
  adminSetBlock,
  adminDeleteUser,
  type AdminUserRow,
} from "@/lib/admin-users.functions";
import { supabase } from "@/integrations/supabase/client";



export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin — Usuários" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const list = useServerFn(adminListUsers);
  const grant = useServerFn(adminGrantRole);
  const revoke = useServerFn(adminRevokeRole);
  const createUser = useServerFn(adminCreateUser);
  const setBlock = useServerFn(adminSetBlock);
  const deleteUser = useServerFn(adminDeleteUser);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"" | "pro" | "plus" | "admin">("");
  const [creating, setCreating] = useState(false);


  // A sessão do Supabase vive no localStorage e pode não estar hidratada no
  // primeiro render; sem ela o serverFn é chamado sem Authorization e falha.
  const session = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
    staleTime: 30_000,
    retry: false,
  });

  const q = useQuery<AdminUserRow[]>({
    queryKey: ["admin-users"],
    queryFn: () => list(),
    enabled: Boolean(session.data?.access_token),
    retry: false,
  });


  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const toggle = async (userId: string, role: "pro" | "plus" | "admin", has: boolean) => {
    const key = `${userId}:${role}`;
    setBusy(key);
    try {
      if (has) {
        await revoke({ data: { userId, role } });
        toast.success(`${role} revogado`);
      } else {
        await grant({ data: { userId, role } });
        toast.success(`${role} liberado`);
      }
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setBusy(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      await createUser({
        data: {
          email: newEmail,
          password: newPassword,
          ...(newRole ? { role: newRole } : {}),
        },
      });
      toast.success("Conta criada e autorizada.");
      setNewEmail("");
      setNewPassword("");
      setNewRole("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar conta");
    } finally {
      setCreating(false);
    }
  };

  const handleBlock = async (userId: string, blocked: boolean) => {
    setBusy(`${userId}:block`);
    try {
      await setBlock({ data: { userId, blocked } });
      toast.success(blocked ? "Conta bloqueada" : "Conta desbloqueada");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha");
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (userId: string, email: string | null) => {
    if (!window.confirm(`Excluir definitivamente a conta ${email ?? userId}?`)) return;
    setBusy(`${userId}:delete`);
    try {
      await deleteUser({ data: { userId } });
      toast.success("Conta excluída");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha");
    } finally {
      setBusy(null);
    }
  };


  if (q.isError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">
          Apenas administradores podem ver este painel.
        </p>
      </div>
    );
  }

  const allUsers = Array.isArray(q.data) ? q.data : [];
  const rows = allUsers.filter((u) => filter ? (u.email ?? "").toLowerCase().includes(filter.trim().toLowerCase()) : true);
  const confirmedCount = allUsers.filter((u) => Boolean(u.email_confirmed_at) && !u.blocked).length;
  const pendingCount = allUsers.filter((u) => !u.email_confirmed_at).length;
  const blockedCount = allUsers.filter((u) => u.blocked).length;
  const privilegedCount = allUsers.filter((u) => u.roles.some((role) => ["pro", "plus", "admin"].includes(role))).length;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
            painel de administração
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Gestão de usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Libere manualmente os planos <span className="text-neon font-semibold">PRO</span> e{" "}
            <span className="text-neon-purple font-semibold">Agent Plus</span> após confirmação
            do pagamento no WhatsApp.
          </p>
        </div>
        <button type="button" onClick={() => { void qc.invalidateQueries({ queryKey: ["admin-users"] }); }} disabled={q.isFetching} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 disabled:opacity-50"><RefreshCw className={`size-4 ${q.isFetching ? "animate-spin" : ""}`} />Atualizar lista</button>
        <div className="hidden items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filtrar por email…"
            className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <section aria-label="Resumo de usuários" className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<Users className="size-4" />} label="Total de contas" value={q.isLoading ? "—" : allUsers.length} detail="Contas registradas" />
        <SummaryCard icon={<UserCheck className="size-4" />} label="Ativas e confirmadas" value={q.isLoading ? "—" : confirmedCount} detail="E-mail confirmado e sem bloqueio" tone="green" />
        <SummaryCard icon={<Clock3 className="size-4" />} label="Confirmação pendente" value={q.isLoading ? "—" : pendingCount} detail="Ainda não confirmaram o e-mail" tone="amber" />
        <SummaryCard icon={<ShieldAlert className="size-4" />} label="Bloqueadas" value={q.isLoading ? "—" : blockedCount} detail={`${privilegedCount} conta(s) com plano ou privilégio` } tone="red" />
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/30">
        <div className="border-b border-border/70 px-5 py-4"><h2 className="text-sm font-semibold">Criar conta manualmente</h2><p className="mt-1 text-xs text-muted-foreground">Use apenas para cadastros autorizados pela administração.</p></div>
      <form
        onSubmit={handleCreate}
        className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_auto] sm:p-5"
      >
        <input
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="e-mail autorizado"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="senha inicial (mín. 8)"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as typeof newRole)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">sem plano</option>
          <option value="pro">PRO</option>
          <option value="plus">Agent Plus</option>
          <option value="admin">Admin</option>
        </select>
        <button
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Cadastrar
        </button>
      </form>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/20">
        <div className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div><h2 className="text-sm font-semibold">Contas cadastradas</h2><p className="mt-1 text-xs text-muted-foreground">{q.isLoading ? "Carregando registros…" : `${rows.length} de ${allUsers.length} conta(s)${filter ? " encontradas" : ""}`}</p></div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-2 sm:max-w-sm"><Search className="size-4 shrink-0 text-muted-foreground" /><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por e-mail…" aria-label="Buscar usuários por e-mail" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />{filter && <button type="button" onClick={() => setFilter("")} className="text-xs text-muted-foreground hover:text-foreground">Limpar</button>}</label>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-card/60 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cadastrado</th>
              <th className="px-4 py-3">Último login</th>
              <th className="px-4 py-3">Planos ativos</th>
              <th className="px-4 py-3 text-right">Ações</th>

            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  carregando…
                </td>
              </tr>
            )}
            {!q.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  nenhum usuário
                </td>
              </tr>
            )}
            {rows.map((u) => {
              const isPro = u.roles.includes("pro") || u.roles.includes("plus") || u.roles.includes("admin");
              const isPlus = u.roles.includes("plus") || u.roles.includes("admin");
              const isAdm = u.roles.includes("admin");
              return (
                <tr key={u.id} className="border-t border-border/60 hover:bg-card/40">
                  <td className="px-4 py-3 font-mono text-xs">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest " +
                        (u.blocked
                          ? "bg-destructive/20 text-destructive"
                          : u.email_confirmed_at
                            ? "bg-neon/20 text-neon"
                            : "border border-border text-muted-foreground")
                      }
                      title={u.block_reason ?? undefined}
                    >
                      {u.blocked ? "bloqueado" : u.email_confirmed_at ? "confirmado" : "pendente"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "nunca"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.length === 0 && (
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          free
                        </span>
                      )}
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={
                            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest " +
                            (r === "admin"
                              ? "bg-destructive/20 text-destructive"
                              : r === "plus"
                                ? "bg-neon-purple/20 text-neon-purple"
                                : r === "pro"
                                  ? "bg-neon/20 text-neon"
                                  : "border border-border text-muted-foreground")
                          }
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <RoleBtn
                        label="PRO"
                        icon={<Crown className="size-3" />}
                        active={isPro}
                        busy={busy === `${u.id}:pro`}
                        onClick={() => toggle(u.id, "pro", u.roles.includes("pro"))}
                        tone="neon"
                      />
                      <RoleBtn
                        label="Plus"
                        icon={<Sparkles className="size-3" />}
                        active={isPlus}
                        busy={busy === `${u.id}:plus`}
                        onClick={() => toggle(u.id, "plus", u.roles.includes("plus"))}
                        tone="purple"
                      />
                      <RoleBtn
                        label="Admin"
                        icon={<ShieldCheck className="size-3" />}
                        active={isAdm}
                        busy={busy === `${u.id}:admin`}
                        onClick={() => toggle(u.id, "admin", isAdm)}
                        tone="danger"
                      />
                      <button
                        disabled={busy === `${u.id}:block`}
                        onClick={() => handleBlock(u.id, !u.blocked)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
                      >
                        <Ban className="size-3" />
                        {u.blocked ? "desbloquear" : "bloquear"}
                      </button>
                      <button
                        disabled={busy === `${u.id}:delete`}
                        onClick={() => handleDelete(u.id, u.email)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <Trash2 className="size-3" />
                        excluir
                      </button>
                    </div>

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, value, detail, tone = "default" }: { icon: React.ReactNode; label: string; value: string | number; detail: string; tone?: "default" | "green" | "amber" | "red" }) {
  const tones = { default: "border-border/70 bg-card/60 text-foreground", green: "border-neon/20 bg-neon/5 text-neon", amber: "border-amber-500/20 bg-amber-500/5 text-amber-400", red: "border-destructive/20 bg-destructive/5 text-destructive" };
  return <div className={`rounded-2xl border p-4 ${tones[tone]}`}><div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className="grid size-8 place-items-center rounded-xl bg-background/70">{icon}</span></div><div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</div><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</p></div>;
}

function RoleBtn({
  label,
  icon,
  active,
  busy,
  onClick,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  busy: boolean;
  onClick: () => void;
  tone: "neon" | "purple" | "danger";
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50";
  const styles = active
    ? tone === "neon"
      ? "bg-neon text-background"
      : tone === "purple"
        ? "bg-neon-purple text-white"
        : "bg-destructive text-white"
    : tone === "neon"
      ? "border border-neon/40 text-neon hover:bg-neon/10"
      : tone === "purple"
        ? "border border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10"
        : "border border-destructive/40 text-destructive hover:bg-destructive/10";
  return (
    <button disabled={busy} onClick={onClick} className={`${base} ${styles}`}>
      {active ? <X className="size-3" /> : icon}
      {active ? `revogar ${label}` : `liberar ${label}`}
    </button>
  );
}
