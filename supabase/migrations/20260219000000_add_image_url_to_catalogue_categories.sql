-- Add image_url to catalogue_categories so admin can store category thumbnails
ALTER TABLE catalogue_categories
ADD COLUMN IF NOT EXISTS image_url TEXT;

