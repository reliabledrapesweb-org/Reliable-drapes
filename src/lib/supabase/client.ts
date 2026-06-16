/**
 * Browser-side Supabase client
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let _browserClient: SupabaseClient | null = null;

/**
 * Get or create Supabase browser client.
 * Uses a function (not IIFE) so the client is created lazily on first
 * client-side access, avoiding SSR null-caching issues on Cloudflare.
 * Returns null when env vars are unavailable (e.g. Cloudflare edge runtime).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_browserClient) return _browserClient;

  if (typeof window === 'undefined') {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  _browserClient = createBrowserClient(url, anonKey, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        
        const matches = document.cookie.match(
          new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/+^])/g, '\\$1') + '=([^;]*)') 
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
}

/**
 * @deprecated Use `getSupabaseClient()` instead.
 * Kept for backward compatibility — calls the lazy getter.
 * Returns a no-op stub when the real client is unavailable (e.g. Cloudflare edge).
 */
const noopHandler: ProxyHandler<any> = {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a no-op function for method calls like .auth.getSession()
      // so the app doesn't crash when Supabase is unavailable.
      return () => Promise.resolve({ data: null, error: { message: 'Supabase client unavailable' } });
    }
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
};

export const supabaseClient = new Proxy({} as SupabaseClient, noopHandler);