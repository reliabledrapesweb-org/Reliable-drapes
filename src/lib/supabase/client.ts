/**
 * Browser-side Supabase client
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Create Supabase browser client
 */
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
