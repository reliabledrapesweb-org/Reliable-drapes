-- New exhibition year-based structure
CREATE TABLE exhibition_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE exhibition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id uuid REFERENCES exhibition_years(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('exhibition', 'moment', 'news')),
  title text NOT NULL,
  description text,
  image_url text,
  source_name text,
  article_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- updated_at triggers
CREATE TRIGGER set_exhibition_years_updated_at
  BEFORE UPDATE ON exhibition_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_exhibition_items_updated_at
  BEFORE UPDATE ON exhibition_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE exhibition_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_items ENABLE ROW LEVEL SECURITY;

-- Public read for active items
CREATE POLICY "Public can read active exhibition years"
  ON exhibition_years FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active exhibition items"
  ON exhibition_items FOR SELECT
  USING (is_active = true);

-- Admin full access (uses the service role key via getAdminSupabase)
-- No admin INSERT/UPDATE/DELETE policies needed since admin uses service role

-- Migrate existing data from exhibitions table
INSERT INTO exhibition_years (year)
SELECT DISTINCT EXTRACT(YEAR FROM start_date)::int
FROM exhibitions
WHERE start_date IS NOT NULL
ON CONFLICT (year) DO NOTHING;

INSERT INTO exhibition_items (year_id, type, title, description, image_url, is_active)
SELECT ey.id, 'exhibition', e.title, e.description, e.image_url, e.is_active
FROM exhibitions e
JOIN exhibition_years ey ON ey.year = EXTRACT(YEAR FROM e.start_date)::int
WHERE e.start_date IS NOT NULL;
