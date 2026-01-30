# Catalogue Categories Implementation Plan

## Overview

Create a proper category management system for catalogues similar to product categories, with full CRUD operations in the admin panel.

## Implementation Steps

### 1. Database Migration

**File:** `supabase/migrations/[timestamp]_create_catalogue_categories.sql`

```sql
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
    FOR ALL USING (auth.role() = 'authenticated');

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
```

### 2. Server Actions for Catalogue Categories

**File:** `src/lib/actions/catalogue-categories.ts`

```typescript
"use server";

import { getAdminSupabase, getAnonSupabase } from "@/lib/supabase/admin";

export interface CatalogueCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  catalogue_count?: number;
}

export interface CreateCatalogueCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCatalogueCategoryInput extends Partial<CreateCatalogueCategoryInput> {
  id: string;
}

// Get all active categories (public)
export async function getCatalogueCategories(): Promise<{
  success: boolean;
  data?: CatalogueCategory[];
  error?: string;
}> {
  try {
    const supabase = getAnonSupabase();
    const { data, error } = await supabase
      .from("catalogue_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get all categories with counts (admin)
export async function getAllCatalogueCategories(): Promise<{
  success: boolean;
  data?: CatalogueCategory[];
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("catalogue_categories")
      .select("*")
      .order("sort_order")
      .order("name");

    if (error) throw error;

    // Get catalogue counts
    const categoriesWithCounts = await Promise.all(
      data.map(async (category) => {
        const { count } = await supabase
          .from("catalogues")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);
        return { ...category, catalogue_count: count || 0 };
      }),
    );

    return { success: true, data: categoriesWithCounts };
  } catch (error) {
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Create category
export async function createCatalogueCategory(
  input: CreateCatalogueCategoryInput,
): Promise<{ success: boolean; data?: CatalogueCategory; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    // Generate slug from name if not provided
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("catalogue_categories")
      .insert({
        name: input.name,
        slug,
        description: input.description || null,
        sort_order: input.sort_order || 0,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to create category" };
  }
}

// Update category
export async function updateCatalogueCategory(
  input: UpdateCatalogueCategoryInput,
): Promise<{ success: boolean; data?: CatalogueCategory; error?: string }> {
  try {
    const supabase = getAdminSupabase();
    const { id, ...updates } = input;

    // Generate slug if name is updated but slug isn't
    if (updates.name && !updates.slug) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }

    const { data, error } = await supabase
      .from("catalogue_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to update category" };
  }
}

// Delete category
export async function deleteCatalogueCategory(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    // Check if category has catalogues
    const { count } = await supabase
      .from("catalogues")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${count} catalogue(s). Reassign or delete catalogues first.`,
      };
    }

    const { error } = await supabase
      .from("catalogue_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}
```

### 3. Update Catalogue Actions

**File:** `src/lib/actions/catalogues.ts`

Update to join with catalogue_categories table:

```typescript
// Update Catalogue interface
export interface Catalogue {
  id: string;
  title: string;
  description: string | null;
  subtitle: string | null;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  file_url: string;
  pdf_url?: string;
  thumbnail_url: string | null;
  image_url: string | null;
  badge: "new" | "discount" | null;
  discount_value: string | null;
  file_size: number;
  download_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Update getCatalogues to include category
export async function getCatalogues() {
  try {
    const supabase = getAnonSupabase();
    const { data, error } = await supabase
      .from("catalogues")
      .select(
        `
        *,
        category:category_id (
          id,
          name,
          slug
        )
      `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}
```

### 4. Update Admin Catalogues Page

**File:** `src/app/admin/catalogues/page.tsx`

Add category management UI:

```typescript
// Add new state
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [categories, setCategories] = useState<CatalogueCategory[]>([]);

// Add category management functions
const fetchCategories = async () => {
  const result = await getAllCatalogueCategories();
  if (result.success && result.data) {
    setCategories(result.data);
  }
};

// Add category modal form
// Replace category text input with Select dropdown
```

### 5. Update E-Catalogue Page

**File:** `src/app/e-catalogue/page.tsx`

Update to use proper category filtering:

```typescript
// Update to fetch categories from new table
const [categories, setCategories] = useState<CatalogueCategory[]>([]);

// Update availableCategories to use category.name
const availableCategories = useMemo(() => {
  return categories.filter(c => c.is_active);
}, [categories]);

// Update filtering logic
const filteredProducts = useMemo(() => {
  return products.filter((product) => {
    const matchesSearch = /* ... */;
    const matchesFilter =
      selectedFilters.length === 0 ||
      selectedFilters.includes(product.category?.name);
    return matchesSearch && matchesFilter;
  });
}, [products, searchQuery, selectedFilters]);
```

### 6. Data Migration Script

**File:** `scripts/migrate-catalogue-categories.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

async function migrateCategories() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Get all unique category names from existing catalogues
  const { data: catalogues } = await supabase
    .from("catalogues")
    .select("category");
  const uniqueCategories = [
    ...new Set(catalogues?.map((c) => c.category).filter(Boolean)),
  ];

  // Create category records
  for (const categoryName of uniqueCategories) {
    const slug = categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const { data: category } = await supabase
      .from("catalogue_categories")
      .insert({ name: categoryName, slug })
      .select()
      .single();

    // Update catalogues with new category_id
    if (category) {
      await supabase
        .from("catalogues")
        .update({ category_id: category.id })
        .eq("category", categoryName);
    }
  }

  console.log("Migration complete!");
}

migrateCategories();
```

## UI/UX Considerations

1. **Admin Page Layout:**
   - Add "Categories" tab next to "Catalogues" tab
   - Show table of categories with name, slug, catalogue count, actions
   - Allow reordering via drag-and-drop or sort_order input

2. **Category Select in Catalogue Form:**
   - Replace text input with searchable Select dropdown
   - Show "No categories found" message if empty
   - Add "+ Create new category" option in dropdown

3. **E-Catalogue Filters:**
   - Show category names (not slugs) in filter sidebar
   - Maintain current filter UI/UX

## Testing Checklist

- [ ] Can create new category
- [ ] Can edit category name (updates slug)
- [ ] Can delete category (blocked if has catalogues)
- [ ] Can reorder categories
- [ ] Category dropdown shows in catalogue form
- [ ] Existing catalogues migrated correctly
- [ ] Filters work on e-catalogue page
- [ ] Category counts accurate in admin

## Files to Create/Modify

**New Files:**

- `supabase/migrations/[timestamp]_create_catalogue_categories.sql`
- `src/lib/actions/catalogue-categories.ts`
- `scripts/migrate-catalogue-categories.ts`

**Modified Files:**

- `src/lib/actions/catalogues.ts` - Update interfaces and queries
- `src/app/admin/catalogues/page.tsx` - Add category management
- `src/app/e-catalogue/page.tsx` - Update filtering logic

## Rollback Plan

If issues occur:

1. Restore catalogues.category text field
2. Copy category names back from catalogue_categories
3. Drop category_id column
4. Drop catalogue_categories table
