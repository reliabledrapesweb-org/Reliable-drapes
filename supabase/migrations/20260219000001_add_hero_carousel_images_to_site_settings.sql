-- Add configurable homepage carousel images to site settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_carousel_images JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE site_settings
SET hero_carousel_images = COALESCE(hero_carousel_images, '[]'::jsonb);
