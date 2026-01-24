-- Fix media usage triggers to strictly use image_url column
-- The previous generic functions caused errors because they referenced file_url which doesn't exist on products table

-- 1. Drop existing problematic triggers
DROP TRIGGER IF EXISTS trigger_product_insert_usage ON products;
DROP TRIGGER IF EXISTS trigger_product_delete_usage ON products;
DROP TRIGGER IF EXISTS trigger_product_images_insert_usage ON product_images;
DROP TRIGGER IF EXISTS trigger_product_images_delete_usage ON product_images;

-- 2. Create specific functions for tables with image_url column
CREATE OR REPLACE FUNCTION increment_media_usage_by_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_url IS NOT NULL THEN
    UPDATE media_library
    SET usage_count = COALESCE(usage_count, 0) + 1
    WHERE file_url = NEW.image_url;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_media_usage_by_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.image_url IS NOT NULL THEN
    UPDATE media_library
    SET usage_count = GREATEST(COALESCE(usage_count, 0) - 1, 0)
    WHERE file_url = OLD.image_url;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. Re-create triggers on products table
CREATE TRIGGER trigger_product_insert_usage
AFTER INSERT OR UPDATE OF image_url ON products
FOR EACH ROW
EXECUTE FUNCTION increment_media_usage_by_image_url();

CREATE TRIGGER trigger_product_delete_usage
AFTER DELETE OR UPDATE OF image_url ON products
FOR EACH ROW
EXECUTE FUNCTION decrement_media_usage_by_image_url();

-- 4. Re-create triggers on product_images table
CREATE TRIGGER trigger_product_images_insert_usage
AFTER INSERT ON product_images
FOR EACH ROW
EXECUTE FUNCTION increment_media_usage_by_image_url();

CREATE TRIGGER trigger_product_images_delete_usage
AFTER DELETE ON product_images
FOR EACH ROW
EXECUTE FUNCTION decrement_media_usage_by_image_url();
