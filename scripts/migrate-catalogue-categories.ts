/**
 * Data Migration Script: Convert existing catalogue text categories to new category system
 *
 * This script should be run once after deploying the catalogue_categories feature.
 * It will:
 * 1. Extract all unique category names from existing catalogues
 * 2. Create category records in the catalogue_categories table
 * 3. Update catalogues to reference the new category IDs
 *
 * Usage: npx ts-node scripts/migrate-catalogue-categories.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Catalogue {
  id: string;
  category: string;
}

interface CreatedCategory {
  id: string;
  name: string;
}

async function migrateCategories() {
  console.log("🚀 Starting catalogue categories migration...\n");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Error: Missing environment variables");
    console.error(
      "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Step 1: Get all catalogues with their text categories
    console.log("📦 Step 1: Fetching existing catalogues...");
    const { data: catalogues, error: fetchError } = await supabase
      .from("catalogues")
      .select("id, category");

    if (fetchError) {
      throw new Error(`Failed to fetch catalogues: ${fetchError.message}`);
    }

    if (!catalogues || catalogues.length === 0) {
      console.log("✅ No catalogues found. Migration complete!\n");
      return;
    }

    console.log(`   Found ${catalogues.length} catalogues\n`);

    // Step 2: Extract unique category names
    console.log("🔍 Step 2: Extracting unique categories...");
    const uniqueCategories = [
      ...new Set(
        catalogues
          .map((c: Catalogue) => c.category)
          .filter(
            (cat: string | null): cat is string => !!cat && cat.trim() !== "",
          ),
      ),
    ];

    console.log(`   Found ${uniqueCategories.length} unique categories:`);
    uniqueCategories.forEach((cat) => console.log(`   - ${cat}`));
    console.log("");

    // Step 3: Create category records
    console.log("📝 Step 3: Creating category records...");
    const createdCategories: CreatedCategory[] = [];

    for (const categoryName of uniqueCategories) {
      const slug = categoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Check if category already exists
      const { data: existingCategory } = await supabase
        .from("catalogue_categories")
        .select("id, name")
        .eq("slug", slug)
        .single();

      if (existingCategory) {
        console.log(
          `   ⚠️  Category "${categoryName}" already exists (ID: ${existingCategory.id})`,
        );
        createdCategories.push({ id: existingCategory.id, name: categoryName });
        continue;
      }

      const { data: newCategory, error: createError } = await supabase
        .from("catalogue_categories")
        .insert({
          name: categoryName,
          slug: slug,
          is_active: true,
          sort_order: 0,
        })
        .select("id, name")
        .single();

      if (createError) {
        console.error(
          `   ❌ Failed to create category "${categoryName}": ${createError.message}`,
        );
        continue;
      }

      console.log(
        `   ✅ Created category "${categoryName}" (ID: ${newCategory.id})`,
      );
      createdCategories.push({ id: newCategory.id, name: categoryName });
    }

    console.log(`\n   Created/found ${createdCategories.length} categories\n`);

    // Step 4: Update catalogues with new category IDs
    console.log("🔄 Step 4: Updating catalogues with category IDs...");
    let updatedCount = 0;
    let failedCount = 0;

    for (const catalogue of catalogues as Catalogue[]) {
      if (!catalogue.category) {
        console.log(`   ⚠️  Skipping catalogue ${catalogue.id} - no category`);
        continue;
      }

      const matchingCategory = createdCategories.find(
        (cat) => cat.name === catalogue.category,
      );

      if (!matchingCategory) {
        console.error(
          `   ❌ No matching category found for "${catalogue.category}"`,
        );
        failedCount++;
        continue;
      }

      const { error: updateError } = await supabase
        .from("catalogues")
        .update({ category_id: matchingCategory.id })
        .eq("id", catalogue.id);

      if (updateError) {
        console.error(
          `   ❌ Failed to update catalogue ${catalogue.id}: ${updateError.message}`,
        );
        failedCount++;
        continue;
      }

      updatedCount++;
    }

    console.log(`\n✅ Migration Complete!`);
    console.log(`   - ${createdCategories.length} categories created/found`);
    console.log(`   - ${updatedCount} catalogues updated`);
    if (failedCount > 0) {
      console.log(`   - ${failedCount} catalogues failed to update`);
    }
    console.log("");

    // Step 5: Summary
    console.log("📊 Final Summary:");
    const { data: finalCategories } = await supabase
      .from("catalogue_categories")
      .select("*")
      .order("name");

    console.log(
      `   Total categories in database: ${finalCategories?.length || 0}`,
    );

    const { data: cataloguesWithCategories } = await supabase
      .from("catalogues")
      .select("id, category_id")
      .not("category_id", "is", null);

    console.log(
      `   Catalogues with category_id: ${cataloguesWithCategories?.length || 0}`,
    );

    const { data: cataloguesWithoutCategories } = await supabase
      .from("catalogues")
      .select("id")
      .is("category_id", null);

    if (cataloguesWithoutCategories && cataloguesWithoutCategories.length > 0) {
      console.log(
        `   ⚠️  Catalogues without category_id: ${cataloguesWithoutCategories.length}`,
      );
    }

    console.log("\n🎉 Migration finished successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateCategories();
