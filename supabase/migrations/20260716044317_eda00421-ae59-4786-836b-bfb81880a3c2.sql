ALTER TABLE public.animmaster_items
  ADD COLUMN IF NOT EXISTS drive_folder_id text,
  ADD COLUMN IF NOT EXISTS drive_video_id text,
  ADD COLUMN IF NOT EXISTS drive_zip_id text,
  ADD COLUMN IF NOT EXISTS drive_instruction_id text,
  ADD COLUMN IF NOT EXISTS instruction_text text;

CREATE UNIQUE INDEX IF NOT EXISTS animmaster_items_slug_key ON public.animmaster_items (slug);