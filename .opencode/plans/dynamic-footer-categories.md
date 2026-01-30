# Dynamic Footer Categories Implementation Plan

## Current State

The Footer component (`src/components/layout/Footer.tsx`) has static category links under the "Shop" section:

- All Products → /shop
- Curtains → /shop?category=curtains
- Upholstery → /shop?category=upholstery
- Sheers → /shop?category=sheers
- Bed sheets → /shop?category=bed-sheets

**Problem**: These are hardcoded. If categories are deleted from the database, these links will lead to 404 errors.

## Solution

Make the category links dynamic by fetching the top 4 categories from the database.

## Implementation Steps

### 1. Update Footer.tsx to Fetch Categories Dynamically

**Add imports:**

```typescript
import { useEffect, useState } from "react";
import { getCategories, type Category } from "@/lib/actions/products";
```

**Add fallback categories:**

```typescript
const fallbackCategories: Category[] = [
  { id: "1", name: "Curtains", slug: "curtains" },
  { id: "2", name: "Upholstery", slug: "upholstery" },
  { id: "3", name: "Sheers", slug: "sheers" },
  { id: "4", name: "Bed Sheets", slug: "bed-sheets" },
];
```

**Add state and fetch logic:**

```typescript
export function Footer() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCategories();
        if (result.success && result.data && result.data.length > 0) {
          setCategories(result.data.slice(0, 4));
        }
      } catch (error) {
        // Keep fallback categories on error
      }
      setIsLoading(false);
    }

    fetchCategories();
  }, []);

  // ... rest of component
}
```

**Replace static category links with dynamic rendering:**

```typescript
{/* Shop Links */}
<div className="space-y-4 lg:col-span-2">
  <h3 className="text-sm tracking-widest uppercase md:text-base">
    Shop
  </h3>
  <ul className="space-y-3 text-sm text-[#7e7e7e] md:text-base">
    <li>
      <motion.a
        href="/shop"
        className="cursor-pointer"
        whileHover={{ color: "#ffffff", x: 3 }}
        transition={{ duration: 0.2 }}
      >
        All Products
      </motion.a>
    </li>
    {isLoading ? (
      // Show skeleton/placeholder while loading
      <>
        <li className="h-5 w-20 animate-pulse rounded bg-gray-700" />
        <li className="h-5 w-24 animate-pulse rounded bg-gray-700" />
        <li className="h-5 w-16 animate-pulse rounded bg-gray-700" />
        <li className="h-5 w-20 animate-pulse rounded bg-gray-700" />
      </>
    ) : (
      categories.map((category) => (
        <li key={category.id}>
          <motion.a
            href={`/shop?category=${category.slug}`}
            className="cursor-pointer"
            whileHover={{ color: "#ffffff", x: 3 }}
            transition={{ duration: 0.2 }}
          >
            {category.name}
          </motion.a>
        </li>
      ))
    )}
  </ul>
</div>
```

## Benefits

1. **Dynamic**: Categories automatically update when database changes
2. **Safe**: Fallback categories ensure footer always renders
3. **User-friendly**: Shows loading state while fetching
4. **Maintainable**: No need to manually update footer when categories change

## Testing Scenarios

1. Normal case: Categories load from database successfully
2. Empty database: Shows fallback categories
3. Less than 4 categories: Shows available categories
4. More than 4 categories: Shows top 4 only
5. API error: Shows fallback categories

## Files to Modify

- `src/components/layout/Footer.tsx` - Main implementation
