-- Create catalogues table
CREATE TABLE IF NOT EXISTS public.catalogues (
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_catalogues_category ON public.catalogues(category);
CREATE INDEX IF NOT EXISTS idx_catalogues_is_active ON public.catalogues(is_active);

-- Enable RLS
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;

-- Public can view active catalogues
CREATE POLICY "Anyone can view active catalogues"
  ON public.catalogues
  FOR SELECT
  USING (is_active = true);

-- Only admins can insert catalogues
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

-- Only admins can update catalogues
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

-- Only admins can delete catalogues
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_catalogues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER catalogues_updated_at
  BEFORE UPDATE ON public.catalogues
  FOR EACH ROW
  EXECUTE FUNCTION update_catalogues_updated_at();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_catalogue_downloads(catalogue_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.catalogues
  SET download_count = download_count + 1
  WHERE id = catalogue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some initial data
INSERT INTO public.catalogues (title, subtitle, category, pdf_url, image_url, badge, product_count) VALUES
  ('Sofa', 'Modern luxury sofa', 'Furniture', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1763565909003-46e9dfb68a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzb2ZhJTIwZnVybml0dXJlfGVufDF8fHx8MTc2NDA1MDE4MHww&ixlib=rb-4.1.0&q=80&w=1080', 'new', 15),
  ('Main Curtains', 'Elegant main curtains', 'Curtains', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1684261556324-a09b2cdf68b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjdXJ0YWlucyUyMGludGVyaW9yfGVufDF8fHx8MTc2Mzk2MzU5Mnww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 24),
  ('Sheer Curtains', 'Light sheer curtains', 'Sheers', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1755722521990-7dbf21a2bc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBzaGVlcnMlMjBjdXJ0YWluc3xlbnwxfHx8fDE3NjQwNzI3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080', 'new', 18),
  ('Comforters', 'Cozy bed comforters', 'Bedding', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1517912191359-67659f8690a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwY29tZm9ydGVyfGVufDF8fHx8MTc2NDA3MjczOXww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 12),
  ('Accent Chair', 'Stylish accent chair', 'Furniture', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 8),
  ('Upholstery', 'Premium upholstery fabric', 'Upholstery', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1759722666941-a90d5a15b1d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwdXBob2xzdGVyeSUyMGNoYWlyfGVufDF8fHx8MTc2NDA3MjczOHww&ixlib=rb-4.1.0&q=80&w=1080', 'new', 20);
