/**
 * Script to add description column to catalogues table
 * Run with: node scripts/add-description-column.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDescriptionColumn() {
  console.log('🔄 Adding description column to catalogues table...\n');

  try {
    // Add description column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.catalogues 
        ADD COLUMN IF NOT EXISTS description TEXT;
      `
    });

    if (alterError) {
      // If RPC doesn't exist, we need to use raw SQL via the REST API
      // This is a workaround - ideally use Supabase Dashboard SQL Editor
      console.log('⚠️  Cannot add column via API. Please run this SQL in Supabase Dashboard:\n');
      console.log('----------------------------------------');
      console.log('ALTER TABLE public.catalogues');
      console.log('ADD COLUMN IF NOT EXISTS description TEXT;');
      console.log('');
      console.log('UPDATE public.catalogues');
      console.log('SET description = subtitle');
      console.log('WHERE description IS NULL AND subtitle IS NOT NULL;');
      console.log('----------------------------------------\n');
      console.log('📍 Go to: https://supabase.com/dashboard/project/btimurrpbxhdcupywxxk/sql/new\n');
      return;
    }

    console.log('✅ Description column added successfully');

    // Migrate data from subtitle to description
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.catalogues 
        SET description = subtitle 
        WHERE description IS NULL AND subtitle IS NOT NULL;
      `
    });

    if (updateError) {
      console.log('⚠️  Column added but data migration needs manual step');
    } else {
      console.log('✅ Data migrated from subtitle to description');
    }

    console.log('\n✨ Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Please run the SQL manually in Supabase Dashboard');
  }
}

addDescriptionColumn();
