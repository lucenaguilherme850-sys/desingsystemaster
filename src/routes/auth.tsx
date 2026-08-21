import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — AnimMaster Creative Director" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Conta criada mas ainda não confirmada pelo link do e-mail.
          if (/confirm/i.test(error.message)) {
            setPendingEmail(email);
            toast.error("Confirme seu e-mail para ativar a conta antes de entrar.");
            return;
          }
          throw error;
        }
        navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/" },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada com sucesso.");
          navigate({ to: "/" });
          return;
        }
        setPendingEmail(email);
        toast.success("Confirme seu e-mail para ativar a conta.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na autenticação");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!pendingEmail) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: window.location.origin + "/" },
      });
      if (error) throw error;
      toast.success("Link de confirmação reenviado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível reenviar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl"
      >
        <h1 className="text-2xl font-semibold">
          {mode === "in" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse o Agente Creative Director.
        </p>
        {pendingEmail && (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-500">
            Enviamos um link de confirmação para{" "}
            <span className="font-semibold">{pendingEmail}</span>. Clique nele para
            ativar a conta — só e-mails reais conseguem confirmar.
            <button
              type="button"
              onClick={resend}
              disabled={busy}
              className="mt-2 block underline underline-offset-2 disabled:opacity-60"
            >
              Reenviar e-mail de confirmação
            </button>
          </div>
        )}
        <label className="mt-6 block text-sm">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <label className="mt-4 block text-sm">Senha</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          disabled={busy}
          className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Aguarde..." : mode === "in" ? "Entrar" : "Criar conta"}
        </button>
        {/* Visual edit: Changed text instance to match request while keeping structure */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
          <div className="h-px flex-1 bg-border" />
          <span>continuar</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "in" ? "Não tenho conta — criar" : "Já tenho conta — entrar"}
        </button>
      </form>
    </div>
  );
}