CREATE TABLE public.device_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_hash text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (device_hash, user_id)
);

GRANT SELECT, INSERT ON public.device_accounts TO authenticated;
GRANT ALL ON public.device_accounts TO service_role;

ALTER TABLE public.device_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own device rows select" ON public.device_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own device rows insert" ON public.device_accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_device_accounts_hash ON public.device_accounts (device_hash);

CREATE OR REPLACE FUNCTION public.device_user_count(_device_hash text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(DISTINCT user_id)::int
  FROM public.device_accounts
  WHERE device_hash = _device_hash;
$$;

REVOKE EXECUTE ON FUNCTION public.device_user_count(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.device_user_count(text) TO authenticated, service_role;