-- Add parent_id column to catalogue_categories for hierarchical support
ALTER TABLE catalogue_categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES catalogue_categories(id) ON DELETE CASCADE;

-- Create index for faster parent lookups
CREATE INDEX IF NOT EXISTS idx_catalogue_categories_parent_id ON catalogue_categories(parent_id);

-- Add path column for efficient tree traversal
ALTER TABLE catalogue_categories
ADD COLUMN IF NOT EXISTS path TEXT DEFAULT '';

-- Update existing categories to have path equal to their id
UPDATE catalogue_categories SET path = id::text WHERE path = '' OR path IS NULL;

-- Create function to auto-update path when parent changes
CREATE OR REPLACE FUNCTION update_catalogue_category_path()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path = NEW.id::text;
    ELSE
        SELECT COALESCE(path, '') || '/' || NEW.id::text
        INTO NEW.path
        FROM catalogue_categories
        WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update path
DROP TRIGGER IF EXISTS trigger_update_catalogue_category_path ON catalogue_categories;
CREATE TRIGGER trigger_update_catalogue_category_path
    BEFORE INSERT OR UPDATE OF parent_id ON catalogue_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_catalogue_category_path();

-- Create function to prevent circular references
CREATE OR REPLACE FUNCTION prevent_circular_catalogue_category_reference()
RETURNS TRIGGER AS $$
DECLARE
    current_id UUID;
    depth INT := 0;
    max_depth INT := 10;
BEGIN
    -- If parent_id is null, no cycle possible
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Check if trying to set self as parent
    IF NEW.parent_id = NEW.id THEN
        RAISE EXCEPTION 'A category cannot be its own parent';
    END IF;

    -- Traverse up the tree to check for cycles
    current_id := NEW.parent_id;

    WHILE current_id IS NOT NULL AND depth < max_depth LOOP
        -- If we find the new category ID in the ancestry, it's a cycle
        IF current_id = NEW.id THEN
            RAISE EXCEPTION 'Circular reference detected: cannot set this parent as it would create a cycle';
        END IF;

        -- Move up to the next parent
        SELECT parent_id INTO current_id
        FROM catalogue_categories
        WHERE id = current_id;

        depth := depth + 1;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent circular references
DROP TRIGGER IF EXISTS trigger_prevent_circular_catalogue_category ON catalogue_categories;
CREATE TRIGGER trigger_prevent_circular_catalogue_category
    BEFORE INSERT OR UPDATE OF parent_id ON catalogue_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_catalogue_category_reference();
