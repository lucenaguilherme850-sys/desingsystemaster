import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // O Supabase JS cliente handle o hash/query params automaticamente
      // se estiver inicializado corretamente.
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        toast.error("Erro ao confirmar e-mail. Tente novamente.");
        navigate({ to: "/auth" });
        return;
      }

      if (data?.session) {
        // Só consideramos confirmado se o Supabase marcou o e-mail como validado.
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.email_confirmed_at) {
          toast.success("E-mail confirmado com sucesso! Bem-vindo.");
          navigate({ to: "/" });
        } else {
          navigate({ to: "/verify-email", search: { email: userData.user?.email ?? "" } });
        }
      } else {
        // Pode ser um link expirado ou já usado
        navigate({ to: "/auth" });
      }

    };

    void handleCallback();
  }, [navigate]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Autenticando...
        </p>
      </div>
    </div>
  );
}
