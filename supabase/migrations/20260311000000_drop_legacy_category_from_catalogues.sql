-- Drop the legacy 'category' TEXT column from catalogues table.
-- It was replaced by 'category_id' UUID (FK to catalogue_categories) in migration 20260127000000
-- but never removed, causing NOT NULL constraint violations on insert.

DROP INDEX IF EXISTS idx_catalogues_category;

ALTER TABLE public.catalogues
DROP COLUMN IF EXISTS category;
