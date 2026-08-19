DROP POLICY IF EXISTS "Public read animmaster" ON public.animmaster_items;
CREATE POLICY "Public read animmaster" ON public.animmaster_items FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.animmaster_items TO anon;
GRANT SELECT ON public.animmaster_items TO authenticated;