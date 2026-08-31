import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar com código — Design Master" },
      {
        name: "description",
        content:
          "Acesse o Design Master sem senha: informe seu e-mail e confirme o código de 6 dígitos enviado para sua caixa de entrada.",
      },
      { property: "og:title", content: "Entrar com código — Design Master" },
      {
        property: "og:description",
        content: "Login sem senha por código de verificação enviado ao seu e-mail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

/** Login sem senha: e-mail -> código OTP de 6 dígitos -> sessão. */
function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async (silent = false) => {
    const target = email.trim().toLowerCase();
    if (!target) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: target,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
      setStep("code");
      setCooldown(45);
      if (!silent) toast.success("Código enviado para " + target);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível enviar o código.",
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    const token = code.replace(/\D/g, "");
    if (token.length < 6) {
      toast.error("Digite o código de 6 dígitos.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: "email",
      });
      if (error) throw error;
      toast.success("Acesso liberado.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Código inválido ou expirado.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "email") void sendCode();
          else void verify();
        }}
        className="w-full max-w-md rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl"
      >
        <h1 className="text-2xl font-semibold">
          {step === "email" ? "Entrar" : "Confirme o código"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "email"
            ? "Sem senha. Enviamos um código de verificação para o seu e-mail."
            : `Digite o código de 6 dígitos enviado para ${email}.`}
        </p>

        {step === "email" ? (
          <>
            <label className="mt-6 block text-sm" htmlFor="auth-email">
              E-mail
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              disabled={busy}
              className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Enviando..." : "Enviar código"}
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Só e-mails reais recebem o código — contas falsas não conseguem entrar.
            </p>
          </>
        ) : (
          <>
            <label className="mt-6 block text-sm" htmlFor="auth-code">
              Código de verificação
            </label>
            <input
              id="auth-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.5em] font-semibold"
            />
            <button
              disabled={busy}
              className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Verificando..." : "Confirmar e entrar"}
            </button>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                }}
                className="hover:text-foreground"
              >
                Trocar e-mail
              </button>
              <button
                type="button"
                disabled={busy || cooldown > 0}
                onClick={() => void sendCode()}
                className="underline underline-offset-2 disabled:opacity-50"
              >
                {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
