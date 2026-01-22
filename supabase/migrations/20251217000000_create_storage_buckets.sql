-- Create storage buckets for catalogues, products, and media
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('catalogues', 'catalogues', true),
  ('products', 'products', true),
  ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for catalogues bucket
-- Allow public read access
CREATE POLICY "Public Access for catalogues"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'catalogues');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload catalogues"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'catalogues');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update catalogues"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'catalogues');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete catalogues"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'catalogues');

-- Set up storage policies for products bucket
-- Allow public read access
CREATE POLICY "Public Access for products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update products"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete products"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- Set up storage policies for media bucket
-- Allow public read access
CREATE POLICY "Public Access for media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
