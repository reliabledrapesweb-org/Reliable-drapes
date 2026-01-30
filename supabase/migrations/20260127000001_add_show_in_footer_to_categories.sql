-- Add show_in_footer column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS show_in_footer BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_show_in_footer ON categories(show_in_footer) WHERE show_in_footer = true;

-- Update existing categories - set first 4 published categories to show in footer by default
UPDATE categories 
SET show_in_footer = true 
WHERE id IN (
  SELECT id FROM categories 
  WHERE published = true 
  ORDER BY sort_order, name 
  LIMIT 4
);
