-- Add map link fields for head office and warehouse addresses
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS head_office_map_link TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS warehouse_map_link TEXT DEFAULT NULL;
