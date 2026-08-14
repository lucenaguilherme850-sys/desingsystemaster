
-- Revogar execução pública de funções críticas
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO service_role;

-- Se houver outras funções SECURITY DEFINER no public, revogar e conceder apenas conforme necessário
-- Exemplo: a função tem que ser acessível via RLS, então service_role é o proprietário (SECURITY DEFINER)
-- mas o SELECT na tabela que usa a função deve funcionar. 
-- O linter avisa sobre EXECUTE permissivo.
