-- Fix NULL is_active values in catalogue_categories
-- Categories with NULL is_active should be treated as active (default behavior)

-- First, update any existing categories that have NULL is_active to true
UPDATE catalogue_categories
SET is_active = true
WHERE is_active IS NULL;

-- Drop and recreate the RLS policy to properly handle is_active
-- The old policy: FOR SELECT USING (is_active = true)
-- This fails when is_active is NULL because (NULL = true) returns NULL (not true)

DROP POLICY IF EXISTS "Allow public read access" ON catalogue_categories;

-- Create new policy that treats NULL as active
-- COALESCE(is_active, true) returns true if is_active is NULL
CREATE POLICY "Allow public read access" ON catalogue_categories
    FOR SELECT USING (COALESCE(is_active, true) = true);
