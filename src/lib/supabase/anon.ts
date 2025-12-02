/**
 * Supabase anonymous client for server-side operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _anonClient: SupabaseClient | null = null;

/**
 * Get or create Supabase anonymous client
 * @returns Supabase client with anon key
 * @throws Error if environment variables are missing
 */
export function getAnonSupabase(): SupabaseClient {
  if (_anonClient) return _anonClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase anon env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    );
  }

  _anonClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _anonClient;
}
