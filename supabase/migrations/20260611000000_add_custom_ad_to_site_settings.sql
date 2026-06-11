-- Add custom advertisement fields to site_settings (idempotent)
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS custom_ad_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_ad_image_url text,
  ADD COLUMN IF NOT EXISTS custom_ad_link_url text;
