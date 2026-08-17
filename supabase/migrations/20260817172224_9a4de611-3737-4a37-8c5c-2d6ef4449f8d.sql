GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon;