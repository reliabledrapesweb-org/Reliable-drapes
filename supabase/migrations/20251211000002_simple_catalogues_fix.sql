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

-- Insert sample data with all required fields
INSERT INTO public.catalogues (title, subtitle, category, pdf_url, image_url, badge, product_count) VALUES
  ('Sofa', 'Premium modern sofas and sectionals for contemporary living spaces', 'Furniture', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center', 'new', 15),
  ('Main Curtains', 'Elegant curtains and drapes to transform your windows and rooms', 'Curtains', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center', NULL, 24),
  ('Sheer Curtains', 'Light-filtering sheer curtains for privacy and natural illumination', 'Sheers', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop&crop=center', 'new', 18),
  ('Comforters', 'Luxurious comforters and bedding sets for ultimate comfort', 'Bedding', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop&crop=center', NULL, 12),
  ('Accent Chair', 'Stylish accent chairs to complement any interior design', 'Furniture', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center', NULL, 8),
  ('Upholstery', 'Premium upholstery fabrics for furniture and interior design', 'Upholstery', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center', 'new', 20),
  ('Blinds & Shutters', 'Modern window blinds and shutters for light control and privacy', 'Window Treatments', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center', 'new', 22),
  ('Outdoor Furniture', 'Weather-resistant outdoor furniture for patios and gardens', 'Outdoor', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop&crop=center', NULL, 16),
  ('Wallpaper Collection', 'Designer wallpapers to create stunning feature walls', 'Wall Coverings', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop&crop=center', 'discount', 35),
  ('Rugs & Carpets', 'Handcrafted rugs and carpets to define your living spaces', 'Floor Coverings', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center', NULL, 28);