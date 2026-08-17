CREATE TABLE public.component_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE (user_id, slug)
);

CREATE INDEX idx_component_unlocks_user ON public.component_unlocks(user_id);

GRANT SELECT, INSERT ON public.component_unlocks TO authenticated;
GRANT ALL ON public.component_unlocks TO service_role;

ALTER TABLE public.component_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unlocks"
ON public.component_unlocks FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own unlocks"
ON public.component_unlocks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_unlock_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  used INT;
BEGIN
  SELECT count(*) INTO used FROM public.component_unlocks WHERE user_id = NEW.user_id;
  IF used >= 3 THEN
    RAISE EXCEPTION 'free_unlock_quota_exceeded';
  END IF;
  NEW.expires_at := now() + interval '7 days';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_unlock_quota
BEFORE INSERT ON public.component_unlocks
FOR EACH ROW EXECUTE FUNCTION public.enforce_unlock_quota();

CREATE TRIGGER update_component_unlocks_updated_at
BEFORE UPDATE ON public.component_unlocks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();