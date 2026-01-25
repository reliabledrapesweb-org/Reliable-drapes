-- Add SKU column to products table for better image matching during mass uploads
-- SKU = Stock Keeping Unit - a unique identifier for each product

-- Add SKU column (nullable to not break existing products)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;

-- Create unique index on SKU (allowing nulls, but ensuring uniqueness for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx ON products (sku) WHERE sku IS NOT NULL;

-- Create index for faster SKU lookups
CREATE INDEX IF NOT EXISTS products_sku_idx ON products (sku);

-- Add a comment to describe the column
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier used for image matching in mass uploads';
