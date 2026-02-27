-- Add GEM Assessed logo controls to site settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS gem_assessed_logo_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS gem_assessed_logo_url TEXT;

UPDATE site_settings
SET gem_assessed_logo_enabled = COALESCE(gem_assessed_logo_enabled, false);
