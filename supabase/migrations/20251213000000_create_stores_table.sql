-- ============================================================================
-- STORES TABLE
-- ============================================================================
-- Store locations for the store locator functionality
-- Manages physical store addresses, contact info, hours, and status

-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  hours JSONB DEFAULT '{"monday": "9:00 AM - 6:00 PM", "tuesday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM", "thursday": "9:00 AM - 6:00 PM", "friday": "9:00 AM - 6:00 PM", "saturday": "10:00 AM - 4:00 PM", "sunday": "Closed"}'::jsonb,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active stores (faster queries)
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active);

-- Create index for city/state search
CREATE INDEX IF NOT EXISTS idx_stores_location ON public.stores(city, state, country);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION update_stores_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Public read access for active stores only
CREATE POLICY "Public users can view active stores"
  ON public.stores
  FOR SELECT
  USING (is_active = true);

-- Admin full access (select, insert, update, delete)
CREATE POLICY "Admins can view all stores"
  ON public.stores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create stores"
  ON public.stores
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update stores"
  ON public.stores
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete stores"
  ON public.stores
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.stores IS 'Physical store locations for the store locator';
COMMENT ON COLUMN public.stores.id IS 'Unique identifier for the store';
COMMENT ON COLUMN public.stores.name IS 'Store name/branch identifier';
COMMENT ON COLUMN public.stores.address IS 'Street address of the store';
COMMENT ON COLUMN public.stores.city IS 'City where the store is located';
COMMENT ON COLUMN public.stores.state IS 'State/province of the store';
COMMENT ON COLUMN public.stores.country IS 'Country of the store';
COMMENT ON COLUMN public.stores.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN public.stores.phone IS 'Store contact phone number';
COMMENT ON COLUMN public.stores.email IS 'Store contact email';
COMMENT ON COLUMN public.stores.hours IS 'Store operating hours in JSON format';
COMMENT ON COLUMN public.stores.latitude IS 'Latitude coordinate for map display';
COMMENT ON COLUMN public.stores.longitude IS 'Longitude coordinate for map display';
COMMENT ON COLUMN public.stores.is_active IS 'Whether the store is currently active/open';
COMMENT ON COLUMN public.stores.created_at IS 'Timestamp when store was added';
COMMENT ON COLUMN public.stores.updated_at IS 'Timestamp when store was last updated';
