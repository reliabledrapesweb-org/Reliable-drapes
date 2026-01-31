-- Create about_sections table for CMS-managed About Us page content
CREATE TABLE IF NOT EXISTS about_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    content_json JSONB,
    image_url TEXT,
    image_url_2 TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public read access to active about sections" ON about_sections;
DROP POLICY IF EXISTS "Allow admin full access to about sections" ON about_sections;

-- Public read policy for active sections
CREATE POLICY "Allow public read access to active about sections"
    ON about_sections
    FOR SELECT
    USING (is_active = true);

-- Admin full access policy
CREATE POLICY "Allow admin full access to about sections"
    ON about_sections
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_about_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_about_sections_updated_at_trigger ON about_sections;

CREATE TRIGGER update_about_sections_updated_at_trigger
    BEFORE UPDATE ON about_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_about_sections_updated_at();

-- Insert seed data with current hardcoded content
INSERT INTO about_sections (section_key, title, subtitle, content, content_json, image_url, image_url_2, display_order, is_active)
VALUES
    (
        'founder',
        'Our Founder',
        'Mr. Sumit Narang',
        'Our founder envisioned a home furnishings brand that combines elegance, quality, and innovation. With a deep passion for design and decades of experience in textiles, they built Reliable Drapes on the principles of craftsmanship, creativity, and timeless style.',
        jsonb_build_object(
            'role', 'Founder & CEO',
            'quote', 'To inspire every home with beautiful, functional, and personalized furnishings that bring comfort, elegance, and a sense of individuality to living spaces.'
        ),
        '/images/founderPic.png',
        NULL,
        1,
        true
    ),
    (
        'why-choose',
        'Why Choose Reliable Drapes?',
        NULL,
        'We combine decades of experience, exceptional craftsmanship, and a passion for design with a dedicated designing team to help you style your home. Our experts carefully select the finest collections to ensure every space feels vibrant, personalized, and effortlessly elegant.',
        jsonb_build_object(
            'paragraph_2', 'From the richness of hand-worked embroidery to the finesse of contemporary patterns, our collections cater to every taste—whether you love classic luxury or modern minimalism.'
        ),
        '/images/whyReliablePic.png',
        NULL,
        2,
        true
    ),
    (
        'features',
        'Our Features',
        NULL,
        NULL,
        jsonb_build_array(
            jsonb_build_object(
                'icon', '/images/fi_1.png',
                'title', 'Expertly Curated Designs',
                'description', 'Handpicked collections to elevate every space.'
            ),
            jsonb_build_object(
                'icon', '/images/fi_2.png',
                'title', 'Luxury Craftsmanship',
                'description', 'From rich embroidery to modern minimal patterns.'
            ),
            jsonb_build_object(
                'icon', '/images/fi_3.png',
                'title', 'Dedicated Styling Experts',
                'description', 'Personalized guidance for a home that feels uniquely yours.'
            )
        ),
        NULL,
        NULL,
        3,
        true
    ),
    (
        'vision-mission',
        'Our Vision & Mission',
        NULL,
        'Our mission is to redefine home styling by creating furnishings that combine timeless elegance with modern innovation. We aspire to make every home a reflection of individuality—warm, inviting, and beautifully designed—through fabrics and collections that go beyond imagination.',
        jsonb_build_object(
            'mission_points', jsonb_build_array(
                'Design collections that balance tradition and innovation.',
                'Offer a wide range of fabrics and furnishings curated by our expert designer team.',
                'Ensure durability, comfort, and beauty in every product.',
                'Help customers transform houses into homes that tell their unique story.'
            )
        ),
        '/images/visPic_1.png',
        '/images/target.png',
        4,
        true
    )
ON CONFLICT (section_key) DO NOTHING;
