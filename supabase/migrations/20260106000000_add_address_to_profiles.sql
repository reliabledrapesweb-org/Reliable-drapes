-- Add address and phone fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
ADD COLUMN IF NOT EXISTS phone text;

-- Add comment to document the new columns
COMMENT ON COLUMN profiles.address_line1 IS 'Primary address line';
COMMENT ON COLUMN profiles.address_line2 IS 'Secondary address line (apartment, suite, etc.)';
COMMENT ON COLUMN profiles.phone IS 'User contact phone number';

-- Add avatar_url column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN profiles.avatar_url IS 'URL to the user avatar image';

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars bucket
-- Allow public read access
CREATE POLICY "Public Access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update their own avatar
CREATE POLICY "Authenticated users can update their avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Authenticated users can delete their avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
