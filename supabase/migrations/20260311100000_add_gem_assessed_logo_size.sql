-- Add configurable size for GEM Assessed logo in header
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS gem_assessed_logo_size TEXT NOT NULL DEFAULT 'medium';

UPDATE site_settings
SET gem_assessed_logo_size = COALESCE(gem_assessed_logo_size, 'medium');
