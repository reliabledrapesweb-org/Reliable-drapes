-- Simple fix for catalogues table - recreate with all required columns

-- Drop the existing table if it exists (this will remove any existing data)
DROP TABLE IF EXISTS public.catalogues CASCADE;

-- Create the catalogues table with all required columns
CREATE TABLE public.catalogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  image_url TEXT,
  badge TEXT CHECK (badge IN ('new', 'discount')),
  discount_value TEXT,
  product_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_catalogues_category ON public.catalogues(category);
CREATE INDEX idx_catalogues_is_active ON public.catalogues(is_active);

-- Enable RLS
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active catalogues"
  ON public.catalogues
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert catalogues"
  ON public.catalogues
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update catalogues"
  ON public.catalogues
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete catalogues"
  ON public.catalogues
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_catalogues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER catalogues_updated_at
  BEFORE UPDATE ON public.catalogues
  FOR EACH ROW
  EXECUTE FUNCTION update_catalogues_updated_at();

-- Create download increment function
CREATE OR REPLACE FUNCTION increment_catalogue_downloads(catalogue_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.catalogues
  SET download_count = download_count + 1
  WHERE id = catalogue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
