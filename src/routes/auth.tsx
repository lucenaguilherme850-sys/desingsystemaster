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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/agent" },
        });
        if (error) throw error;
        toast.success("Conta criada — verifique seu e-mail se necessário.");
      }
      navigate({ to: "/agent" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na autenticação");
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