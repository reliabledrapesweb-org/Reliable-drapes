# Fix Catalogues Description Column

## Problem
The admin catalogue page is trying to use a `description` column, but the database only has `subtitle`.

## Solution
Add the `description` column to the catalogues table.

## Steps to Fix

### Option 1: Supabase Dashboard (Recommended - 2 minutes)

1. Go to your Supabase Dashboard SQL Editor:
   https://supabase.com/dashboard/project/btimurrpbxhdcupywxxk/sql/new

2. Copy and paste this SQL:

```sql
-- Add description column to catalogues table
ALTER TABLE public.catalogues 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Migrate existing subtitle data to description
UPDATE public.catalogues 
SET description = subtitle 
WHERE description IS NULL AND subtitle IS NOT NULL;
```

3. Click "Run" or press Ctrl+Enter

4. Done! ✅ You can now add catalogues with descriptions.

### Option 2: Using Node Script

```bash
node scripts/add-description-column.js
```

Note: This may not work if the `exec_sql` RPC function doesn't exist. Use Option 1 instead.

## What This Does

- Adds a new `description` TEXT column to the `catalogues` table
- Copies any existing `subtitle` values to the new `description` column
- Keeps the `subtitle` column for backward compatibility
- The admin page will now work correctly when adding/editing catalogues

## Verification

After running the migration, try adding a new catalogue in the admin panel:
- Go to: /admin/catalogues
- Click "Add Catalogue"
- Fill in the form including the description field
- Save

The error "could not find the description column" should be gone! ✨
