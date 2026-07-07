-- Animmaster mirror gallery
CREATE TABLE public.animmaster_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  position int NOT NULL DEFAULT 0,
  category text NOT NULL,
  name text NOT NULL,
  type_name text NOT NULL DEFAULT '',
  poster_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.animmaster_items TO anon, authenticated;
GRANT ALL ON public.animmaster_items TO service_role;
ALTER TABLE public.animmaster_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read animmaster" ON public.animmaster_items FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX animmaster_items_category_idx ON public.animmaster_items(category, position);