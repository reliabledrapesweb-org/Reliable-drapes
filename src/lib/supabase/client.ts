/**
 * Browser-side Supabase client
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let _browserClient: SupabaseClient | null = null;

/**
 * Create Supabase browser client with cookie-based storage
 * This ensures sessions persist across page reloads
 */
export const supabaseClient = (() => {
  if (typeof window === 'undefined') {
    // Return a placeholder during SSR
    return null as any;
  }

  if (_browserClient) return _browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing Supabase env vars');
    return null as any;
  }

  _browserClient = createBrowserClient(url, anonKey, {
    cookies: {
      get(name: string) {
        // Only run in browser
        if (typeof document === 'undefined') return undefined;
        
        // Parse cookies from document.cookie
        const matches = document.cookie.match(
          new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)') 
        );
        return matches ? decodeURIComponent(matches[1]) : undefined;
      },
      set(name: string, value: string, options: any) {
        // Only run in browser
        if (typeof document === 'undefined') return;
        
        // Set cookie in document.cookie
        let cookieString = `${name}=${encodeURIComponent(value)}`;
        
        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
        }
        if (options?.path) {
          cookieString += `; path=${options.path}`;
        }
        if (options?.domain) {
          cookieString += `; domain=${options.domain}`;
        }
        if (options?.sameSite) {
          cookieString += `; samesite=${options.sameSite}`;
        }
        if (options?.secure) {
          cookieString += '; secure';
        }
        
        document.cookie = cookieString;
      },
      remove(name: string, options: any) {
        // Remove cookie by setting max-age to 0
        this.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  return _browserClient;
})();
