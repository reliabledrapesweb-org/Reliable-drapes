-- Add new site_settings columns for footer, contact, and business hours
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS company_tagline text,
  ADD COLUMN IF NOT EXISTS head_office_address text,
  ADD COLUMN IF NOT EXISTS warehouse_address text,
  ADD COLUMN IF NOT EXISTS contact_call_phone text DEFAULT '+91 98113 31948',
  ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '[{"day":"Monday - Friday","hours":"9:00 AM - 6:00 PM"},{"day":"Saturday","hours":"10:00 AM - 4:00 PM"},{"day":"Sunday","hours":"Closed"}]'::jsonb;

-- Update company_phone to the correct number
UPDATE site_settings SET company_phone = '+91 96257 31948' WHERE company_phone IS NOT NULL;
