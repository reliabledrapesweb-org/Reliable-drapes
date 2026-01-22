-- Create media library table for centralized image management
-- This table will track all uploaded images across the application

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL UNIQUE,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  folder TEXT DEFAULT 'general',
  bucket TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on file_url for faster lookups
CREATE INDEX idx_media_library_file_url ON media_library(file_url);

-- Create index on folder for filtering
CREATE INDEX idx_media_library_folder ON media_library(folder);

-- Create index on bucket for filtering
CREATE INDEX idx_media_library_bucket ON media_library(bucket);

-- Create index on tags for searching
CREATE INDEX idx_media_library_tags ON media_library USING GIN(tags);

-- Create index on created_at for sorting
CREATE INDEX idx_media_library_created_at ON media_library(created_at DESC);

-- Add RLS policies
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view media
CREATE POLICY "Authenticated users can view media"
ON media_library FOR SELECT
TO authenticated
USING (true);

-- Allow admins to insert media
CREATE POLICY "Admins can insert media"
ON media_library FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update media
CREATE POLICY "Admins can update media"
ON media_library FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete media
CREATE POLICY "Admins can delete media"
ON media_library FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_media_library_updated_at
BEFORE UPDATE ON media_library
FOR EACH ROW
EXECUTE FUNCTION update_media_library_updated_at();

-- Create function to increment usage count when media is referenced
CREATE OR REPLACE FUNCTION increment_media_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media_library
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE file_url = NEW.file_url OR file_url = NEW.image_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to track usage in products
CREATE TRIGGER trigger_product_insert_usage
AFTER INSERT OR UPDATE OF image_url ON products
FOR EACH ROW
EXECUTE FUNCTION increment_media_usage_count();

-- Create triggers to track usage in product_images
CREATE TRIGGER trigger_product_images_insert_usage
AFTER INSERT ON product_images
FOR EACH ROW
EXECUTE FUNCTION increment_media_usage_count();

-- Create function to decrement usage count when media is no longer referenced
CREATE OR REPLACE FUNCTION decrement_media_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media_library
  SET usage_count = GREATEST(COALESCE(usage_count, 0) - 1, 0)
  WHERE file_url = OLD.file_url OR file_url = OLD.image_url;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to track deletion from products
CREATE TRIGGER trigger_product_delete_usage
AFTER DELETE OR UPDATE OF image_url ON products
FOR EACH ROW
EXECUTE FUNCTION decrement_media_usage_count();

-- Create triggers to track deletion from product_images
CREATE TRIGGER trigger_product_images_delete_usage
AFTER DELETE ON product_images
FOR EACH ROW
EXECUTE FUNCTION decrement_media_usage_count();

COMMENT ON TABLE media_library IS 'Centralized media library for tracking all uploaded images and files';
COMMENT ON COLUMN media_library.usage_count IS 'Number of times this media is referenced across the application';
COMMENT ON COLUMN media_library.folder IS 'Folder category (e.g., products, banners, ctas, general)';
