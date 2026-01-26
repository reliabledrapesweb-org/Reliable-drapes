-- Fix storage buckets and database cascade issues

-- 1. Ensure storage buckets exist
-- Note: inserting into storage.buckets is safe and common in Supabase migrations
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('catalogues', 'catalogues', true),
  ('products', 'products', true),
  ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Ensure RLS policies for buckets exist (just in case)
-- Policies for 'media' bucket
DO $$
BEGIN
    -- 'media' bucket policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for media' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access for media" ON storage.objects FOR SELECT TO public USING (bucket_id = 'media');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload media' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
    END IF;

    -- 'products' bucket policies (ensure they exist)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for products' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access for products" ON storage.objects FOR SELECT TO public USING (bucket_id = 'products');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload products' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated users can upload products" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
    END IF;
END $$;

-- 3. Fix Product Deletion blocking
-- Create index to speed up foreign key checks
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Ensure junction tables have proper cascade behavior
DO $$
BEGIN
    -- product_collections
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_collections_product_id_fkey') THEN
        ALTER TABLE product_collections DROP CONSTRAINT product_collections_product_id_fkey;
    END IF;
    ALTER TABLE product_collections ADD CONSTRAINT product_collections_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

    -- product_categories
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_categories_product_id_fkey') THEN
        ALTER TABLE product_categories DROP CONSTRAINT product_categories_product_id_fkey;
    END IF;
    ALTER TABLE product_categories ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
END $$;
