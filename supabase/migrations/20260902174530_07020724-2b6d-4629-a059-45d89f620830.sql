CREATE TABLE public.account_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  blocked_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_blocks TO authenticated;
GRANT ALL ON public.account_blocks TO service_role;

ALTER TABLE public.account_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage account blocks"
ON public.account_blocks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can see own block"
ON public.account_blocks FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_account_blocks_updated_at
BEFORE UPDATE ON public.account_blocks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_account_blocked(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.account_blocks WHERE user_id = _user_id);
$$;

REVOKE ALL ON FUNCTION public.is_account_blocked(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_account_blocked(uuid) TO authenticated, service_role;