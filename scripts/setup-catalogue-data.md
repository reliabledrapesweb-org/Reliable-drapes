# Catalogue Data Setup Instructions

## Issue
The database push is failing due to Docker connectivity issues. Here's how to resolve it:

## Steps to Fix

1. **Check Docker Desktop is running**
   - Make sure Docker Desktop is running on your system
   - Restart Docker Desktop if needed

2. **Try pushing the migrations again**
   ```bash
   npx supabase db push
   ```

3. **If still having issues, try resetting Supabase**
   ```bash
   npx supabase stop
   npx supabase start
   npx supabase db push
   ```

## What the migrations will do

- **20251210000000_admin_user_management.sql**: Adds admin policies for user management
- **20251210000001_update_catalogue_data.sql**: Updates catalogue data with real image URLs and PDF URLs

## Expected Result
After successful migration, your e-catalogue page will show:
- Real product images from Unsplash
- Working PDF download links
- Better product variety with proper categories

## Manual Alternative
If migrations continue to fail, you can manually run the SQL from `scripts/update-catalogue-data.sql` in your Supabase dashboard.