import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logSecurityEvent } from "@/lib/security-events";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Design Master" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta Design Master com segurança.",
      },
      { property: "og:title", content: "Redefinir senha — Design Master" },
      {
        property: "og:description",
        content: "Crie uma nova senha para recuperar o acesso à sua conta Design Master.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // O link de recuperação cria uma sessão temporária no cliente.
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      setReady(Boolean(data.session));
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(
          /pwned|compromis/i.test(error.message)
            ? "Essa senha aparece em vazamentos conhecidos. Escolha outra."
            : "Não foi possível redefinir a senha. Solicite um novo link.",
        );
        return;
      }
      void logSecurityEvent("password_reset_completed", {});
      toast.success("Senha atualizada. Faça login novamente.");
      await supabase.auth.signOut();
      navigate({ to: "/auth" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-[80vh] place-items-center px-4 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-8 backdrop-blur-xl"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-semibold text-foreground">Nova senha</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {ready
            ? "Escolha uma senha com pelo menos 8 caracteres."
            : "Abra esta página pelo link enviado ao seu e-mail."}
        </p>

        <label className="mt-6 block text-sm text-foreground" htmlFor="new-password">
          Nova senha
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />

        <label className="mt-4 block text-sm text-foreground" htmlFor="confirm-password">
          Confirmar senha
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />

        <button
          disabled={busy || !ready}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          Salvar nova senha
        </button>
      </form>
    </main>
  );
}
