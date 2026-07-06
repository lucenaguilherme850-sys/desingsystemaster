
-- Assets library
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  demo_component TEXT,
  short_description TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  how_it_works TEXT NOT NULL DEFAULT '',
  flow TEXT[] NOT NULL DEFAULT '{}',
  technologies TEXT[] NOT NULL DEFAULT '{}',
  html_structure TEXT NOT NULL DEFAULT '',
  css_notes TEXT NOT NULL DEFAULT '',
  js_notes TEXT NOT NULL DEFAULT '',
  math TEXT[] NOT NULL DEFAULT '{}',
  events TEXT[] NOT NULL DEFAULT '{}',
  algorithm TEXT NOT NULL DEFAULT '',
  performance JSONB NOT NULL DEFAULT '{}'::jsonb,
  responsiveness TEXT NOT NULL DEFAULT '',
  accessibility TEXT NOT NULL DEFAULT '',
  dependencies TEXT[] NOT NULL DEFAULT '{}',
  complexity INT NOT NULL DEFAULT 1 CHECK (complexity BETWEEN 1 AND 10),
  estimated_time TEXT NOT NULL DEFAULT '',
  issues TEXT[] NOT NULL DEFAULT '{}',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  variations TEXT[] NOT NULL DEFAULT '{}',
  compatibility TEXT[] NOT NULL DEFAULT '{}',
  reuse TEXT NOT NULL DEFAULT '',
  code_base TEXT NOT NULL DEFAULT '',
  checklist TEXT[] NOT NULL DEFAULT '{}',
  visual_impact INT NOT NULL DEFAULT 5 CHECK (visual_impact BETWEEN 1 AND 10),
  ux_impact INT NOT NULL DEFAULT 5 CHECK (ux_impact BETWEEN 1 AND 10),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX assets_category_idx ON public.assets(category);
CREATE INDEX assets_created_by_idx ON public.assets(created_by);

GRANT SELECT ON public.assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can read the library.
CREATE POLICY "Public read assets"
  ON public.assets FOR SELECT
  USING (true);

-- Any authenticated user can create assets (they become the owner).
CREATE POLICY "Authenticated users can create assets"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only owner can update.
CREATE POLICY "Owner can update own assets"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Only owner can delete.
CREATE POLICY "Owner can delete own assets"
  ON public.assets FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
