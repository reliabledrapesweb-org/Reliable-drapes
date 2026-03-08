-- Create catalogue_categories table
CREATE TABLE IF NOT EXISTS catalogue_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add unique index on name for case-insensitive lookup
CREATE UNIQUE INDEX idx_catalogue_categories_name ON catalogue_categories (LOWER(name));

-- Enable RLS
ALTER TABLE catalogue_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access" ON catalogue_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access" ON catalogue_categories
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

-- Add category_id to catalogues table
ALTER TABLE catalogues 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES catalogue_categories(id);

-- Create index for faster lookups
CREATE INDEX idx_catalogues_category_id ON catalogues(category_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_catalogue_categories_updated_at
    BEFORE UPDATE ON catalogue_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
