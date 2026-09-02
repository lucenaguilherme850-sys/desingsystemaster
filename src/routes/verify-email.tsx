import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Verifique seu e-mail — Design Master" },
      {
        name: "description",
        content:
          "Confirme o endereço de e-mail para ativar sua conta Design Master e liberar o acesso completo.",
      },
      { property: "og:title", content: "Verifique seu e-mail — Design Master" },
      {
        property: "og:description",
        content: "Ative sua conta confirmando o e-mail enviado pela Design Master.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email: searchEmail } = Route.useSearch();
  const [email, setEmail] = useState(searchEmail);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);

  // Se a sessão já existe e o e-mail está confirmado, não faz sentido ficar aqui.
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email && !email) setEmail(data.user.email);
      if (data.user?.email_confirmed_at) navigate({ to: "/" });
    })();
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resend = async () => {
    if (cooldown > 0 || busy) return;
    if (!email) {
      toast.error("Informe o e-mail usado no cadastro.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      // Resposta uniforme: nunca revela se o endereço existe.
      if (error && /rate|too many/i.test(error.message)) {
        toast.error("Muitas solicitações. Aguarde alguns minutos.");
      } else {
        toast.success("Se a conta existir e ainda não estiver confirmada, o e-mail foi reenviado.");
      }
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setBusy(false);
    }
  };

  const changeEmail = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <main className="grid min-h-[80vh] place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-foreground">Verifique seu e-mail</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos uma mensagem de confirmação para:
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-foreground">
          {email || "seu endereço de e-mail"}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Acesse seu e-mail e confirme o endereço para ativar sua conta. Enquanto isso, a conta
          permanece <strong className="text-foreground">não ativada</strong> e as funcionalidades
          protegidas continuam bloqueadas.
        </p>

        {!searchEmail && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail do cadastro"
            className="mt-5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        )}

        <button
          type="button"
          onClick={() => void resend()}
          disabled={busy || cooldown > 0}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {cooldown > 0 ? `Aguarde ${cooldown}s para reenviar` : "Reenviar e-mail"}
        </button>
        {cooldown > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Aguarde alguns segundos antes de solicitar um novo e-mail.
          </p>
        )}

        <button
          type="button"
          onClick={() => void changeEmail()}
          className="mt-3 w-full rounded-md border border-border bg-background py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Alterar e-mail
        </button>
      </section>
    </main>
  );
}
