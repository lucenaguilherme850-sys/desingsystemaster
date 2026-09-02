import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Crown, Sparkles, ShieldCheck, X, Search, Ban, Trash2, UserPlus, Loader2 } from "lucide-react";
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

  const rows = (Array.isArray(q.data) ? q.data : []).filter((u) =>
    filter ? (u.email ?? "").toLowerCase().includes(filter.toLowerCase()) : true,
  );

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
            painel de administração
          </div>
          <h1 className="mt-2 text-3xl font-extrabold uppercase">Usuários cadastrados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Libere manualmente os planos <span className="text-neon font-semibold">PRO</span> e{" "}
            <span className="text-neon-purple font-semibold">Agent Plus</span> após confirmação
            do pagamento no WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filtrar por email…"
            className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Cadastrado</th>
              <th className="px-4 py-3">Último login</th>
              <th className="px-4 py-3">Planos ativos</th>
              <th className="px-4 py-3 text-right">Liberar</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  carregando…
                </td>
              </tr>
            )}
            {!q.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
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
