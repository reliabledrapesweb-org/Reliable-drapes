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

    return null as any;
  }

  _browserClient = createBrowserClient(url, anonKey, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        
        const matches = document.cookie.match(
          new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)') 
        );
        return matches ? decodeURIComponent(matches[1]) : undefined;
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return;
        
        let cookieString = `${name}=${encodeURIComponent(value)}`;
        
        cookieString += `; path=${options?.path || '/'}`;
        
        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
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
        this.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  return _browserClient;
})();