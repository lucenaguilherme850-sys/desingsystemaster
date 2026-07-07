
DO $$ BEGIN
  CREATE POLICY "public read animmaster assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'animmaster-assets');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
