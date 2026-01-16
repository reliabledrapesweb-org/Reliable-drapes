-- Add description column to catalogues table
-- This replaces the subtitle column with a proper description field

ALTER TABLE public.catalogues 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Migrate existing subtitle data to description if description is null
UPDATE public.catalogues 
SET description = subtitle 
WHERE description IS NULL AND subtitle IS NOT NULL;

-- Optional: Drop subtitle column if you want to fully migrate
-- Uncomment the line below if you want to remove the subtitle column entirely
-- ALTER TABLE public.catalogues DROP COLUMN IF EXISTS subtitle;
