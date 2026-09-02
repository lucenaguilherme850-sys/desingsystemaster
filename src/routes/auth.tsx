import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import logo from "@/assets/dm-logo.png.asset.json";
import { logSecurityEvent } from "@/lib/security-events";
import { applyRememberMe } from "@/lib/session-persistence";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Design Master" },
      {
        name: "description",
        content:
          "Acesse sua conta Design Master com e-mail e senha ou com o Google e desbloqueie a biblioteca de componentes premium.",
      },
      { property: "og:title", content: "Entrar — Design Master" },
      {
        property: "og:description",
        content: "Login seguro na biblioteca de componentes premium Design Master.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot" | "mfa";

/** Mensagem genérica: nunca revela se o e-mail existe no sistema. */
const GENERIC_CREDENTIALS_ERROR = "E-mail ou senha incorretos.";

/** Proteção local contra tentativas repetidas (complementa o rate limit do servidor). */
const ATTEMPTS_KEY = "dm.auth.attempts";
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;

function readAttempts(): { count: number; until: number } {
  if (typeof window === "undefined") return { count: 0, until: 0 };
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? "") ?? { count: 0, until: 0 };
  } catch {
    return { count: 0, until: 0 };
  }
}

function writeAttempts(value: { count: number; until: number }): void {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

/** Score de força de senha (0-4) sem regras exageradas. */
function passwordScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^\w\s]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABEL = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [lockLeft, setLockLeft] = useState(0);

  const score = useMemo(() => passwordScore(password), [password]);

  // Contador visual do bloqueio temporário por tentativas.
  useEffect(() => {
    const tick = () => {
      const { until } = readAttempts();
      setLockLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const registerFailure = () => {
    const current = readAttempts();
    const count = current.until > Date.now() ? current.count : current.count + 1;
    const until = count >= MAX_ATTEMPTS ? Date.now() + LOCK_SECONDS * 1000 : 0;
    writeAttempts({ count: until ? 0 : count, until });
  };

  /** Após senha correta, verifica confirmação de e-mail e segundo fator. */
  const finishSignIn = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user && !userData.user.email_confirmed_at) {
      // Sessão existe, mas a conta não está ativada: nada de acesso completo.
      navigate({ to: "/verify-email", search: { email: userData.user.email ?? email } });
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp?.[0];
      if (factor) {
        setMfaFactorId(factor.id);
        setMode("mfa");
        return;
      }
    }
    writeAttempts({ count: 0, until: 0 });
    applyRememberMe(remember);
    void logSecurityEvent("login_success", { method: "password" });
    toast.success("Bem-vindo de volta.");
    navigate({ to: "/" });
  };


  const handleLogin = async () => {
    if (lockLeft > 0) {
      toast.error(`Muitas tentativas. Tente novamente em ${lockLeft}s.`);
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        registerFailure();
        const msg = error.message.toLowerCase();
        toast.error(
          msg.includes("rate") || msg.includes("too many")
            ? "Muitas tentativas seguidas. Aguarde alguns minutos."
            : GENERIC_CREDENTIALS_ERROR,
        );
        return;
      }
      await finishSignIn();
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async () => {
    if (password.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        toast.error(
          msg.includes("pwned") || msg.includes("compromis")
            ? "Essa senha aparece em vazamentos conhecidos. Escolha outra."
            : msg.includes("rate")
              ? "Muitas tentativas seguidas. Aguarde alguns minutos."
              : msg.includes("weak") || msg.includes("least")
                ? "Senha muito curta ou fraca. Use pelo menos 8 caracteres."
                : "Não foi possível criar a conta agora. Tente novamente.",
        );
        return;
      }
      const target = email.trim().toLowerCase();
      if (!data.session || !data.user?.email_confirmed_at) {
        // Sem confirmação não existe acesso completo — sempre para a tela de verificação.
        toast.success("Conta criada. Confirme o e-mail para ativar o acesso.");
        navigate({ to: "/verify-email", search: { email: target } });
        return;
      }
      applyRememberMe(remember);
      void logSecurityEvent("signup", {});
      toast.success("Conta criada com sucesso.");
      navigate({ to: "/" });

    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    setBusy(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + "/reset-password",
      });
      // Resposta sempre igual — evita enumeração de usuários.
      toast.success(
        "Se existir uma conta associada a este e-mail, enviaremos as instruções de recuperação.",
      );
      setMode("login");
    } finally {
      setBusy(false);
    }
  };

  const handleMfa = async () => {
    if (!mfaFactorId) return;
    setBusy(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });
      if (cErr || !challenge) throw new Error("challenge_failed");
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: mfaCode.replace(/\D/g, ""),
      });
      if (error) {
        toast.error("Código inválido ou expirado.");
        return;
      }
      writeAttempts({ count: 0, until: 0 });
      applyRememberMe(remember);
      void logSecurityEvent("login_success", { method: "password+totp" });
      toast.success("Acesso liberado.");
      navigate({ to: "/" });
    } catch {
      toast.error("Não foi possível validar o segundo fator.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth/callback",
      });
      if (result.error) {
        toast.error("Não foi possível entrar com o Google.");
        return;
      }
      if (result.redirected) return;
      applyRememberMe(remember);
      void logSecurityEvent("login_success", { method: "google" });
      navigate({ to: "/" });
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (mode === "login") void handleLogin();
    else if (mode === "signup") void handleSignup();
    else if (mode === "forgot") void handleForgot();
    else void handleMfa();
  };

  const title =
    mode === "signup"
      ? "Criar sua conta"
      : mode === "forgot"
        ? "Recuperar acesso"
        : mode === "mfa"
          ? "Verificação em duas etapas"
          : "Bem-vindo de volta";

  const subtitle =
    mode === "signup"
      ? "Leva menos de um minuto para começar."
      : mode === "forgot"
        ? "Informe seu e-mail e enviaremos as instruções."
        : mode === "mfa"
          ? "Digite o código do seu aplicativo autenticador."
          : "Entre para acessar sua conta.";

  return (
    <main className="grid min-h-[85vh] place-items-center px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-xl sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <img
            src={logo.url}
            alt="Design Master"
            className="size-12 rounded-xl object-contain"
          />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {mode === "mfa" ? (
          <>
            <label className="mt-6 block text-sm text-foreground" htmlFor="mfa-code">
              Código de 6 dígitos
            </label>
            <input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg font-semibold tracking-[0.5em] text-foreground"
            />
          </>
        ) : (
          <>
            <label className="mt-6 block text-sm text-foreground" htmlFor="auth-email">
              E-mail
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />

            {mode !== "forgot" && (
              <>
                <label className="mt-4 block text-sm text-foreground" htmlFor="auth-password">
                  Senha
                </label>
                <div className="relative mt-1">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {mode === "signup" && password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1" aria-hidden>
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full",
                            i < score ? "bg-primary" : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Força da senha: {STRENGTH_LABEL[score]}
                    </p>
                  </div>
                )}

                {mode === "login" && (
                  <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-4 accent-[hsl(var(--primary))]"
                    />
                    Lembrar de mim neste dispositivo
                  </label>
                )}
              </>
            )}
          </>
        )}

        <button
          disabled={busy || (mode === "login" && lockLeft > 0)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === "login"
            ? lockLeft > 0
              ? `Aguarde ${lockLeft}s`
              : "Entrar"
            : mode === "signup"
              ? "Criar conta"
              : mode === "forgot"
                ? "Enviar instruções"
                : "Confirmar e entrar"}
        </button>

        {mode !== "mfa" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              ou continuar com
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={() => void handleGoogle()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
                />
              </svg>
              Google
            </button>
          </>
        )}

        <div className="mt-6 space-y-2 text-center text-sm">
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Esqueceu sua senha?
              </button>
              <p className="text-muted-foreground">
                Não possui uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Criar conta
                </button>
              </p>
            </>
          )}
          {(mode === "signup" || mode === "forgot" || mode === "mfa") && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Voltar para o login
            </button>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Senhas protegidas pelo provedor de autenticação — nunca são armazenadas pelo site.
        </p>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Ao continuar você concorda com os termos de uso.{" "}
          <Link to="/pricing" className="underline underline-offset-2">
            Ver planos
          </Link>
        </p>
      </form>
    </main>
  );
}
