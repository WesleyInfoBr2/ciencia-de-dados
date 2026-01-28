-- 1. Copy language values to attributes field for items that have language set
UPDATE public.library_items
SET attributes = attributes || jsonb_build_object('language', language)
WHERE language IS NOT NULL AND language != '';

-- 2. Drop is_open_source column
ALTER TABLE public.library_items DROP COLUMN IF EXISTS is_open_source;

-- 3. Drop language column
ALTER TABLE public.library_items DROP COLUMN IF EXISTS language;