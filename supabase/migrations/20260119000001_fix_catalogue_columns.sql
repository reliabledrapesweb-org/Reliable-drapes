-- Fix catalogue table columns to match the application code
-- Add missing columns and rename existing ones

-- Add the missing columns that the application expects
ALTER TABLE public.catalogues
ADD COLUMN IF NOT EXISTS file_url TEXT;

ALTER TABLE public.catalogues
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE public.catalogues
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.catalogues
ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0;

-- Copy data from old columns to new columns (if not already set)
UPDATE public.catalogues
SET file_url = pdf_url
WHERE file_url IS NULL AND pdf_url IS NOT NULL;

UPDATE public.catalogues
SET thumbnail_url = image_url
WHERE thumbnail_url IS NULL AND image_url IS NOT NULL;

UPDATE public.catalogues
SET description = subtitle
WHERE description IS NULL AND subtitle IS NOT NULL;

-- Now we can drop the old columns
ALTER TABLE public.catalogues
DROP COLUMN IF EXISTS pdf_url;

ALTER TABLE public.catalogues
DROP COLUMN IF EXISTS image_url;

ALTER TABLE public.catalogues
DROP COLUMN IF EXISTS subtitle;
