"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supabaseClient } from "@/lib/supabase/client";

/**
 * AuthProvider - Restores auth state from Supabase on app load
 * Uses server-side session check + client-side sync
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession } = useAuthStore();
  const [isRestored, setIsRestored] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check if we have OAuth callback parameters in URL
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthParams = urlParams.has('code') || urlParams.has('error');

        // Client-side session check is reliable because browser has cookies
        const { data, error } = await supabaseClient.auth.getSession();

        if (!error && data.session) {
          const session = data.session;
          const user = session.user;

          if (user) {
            setUser({
              id: user.id,
              email: user.email || "",
              full_name:
                (user.user_metadata?.full_name as string) || undefined,
            });

            setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token || "",
              expires_at: session.expires_at,
              user: {
                id: user.id,
                email: user.email || "",
                full_name:
                  (user.user_metadata?.full_name as string) ||
                  undefined,
              },
            });

            // Clean up OAuth parameters from URL after successful authentication
            if (hasOAuthParams) {
              const cleanUrl = window.location.pathname;
              router.replace(cleanUrl);
            }
          }
        } else {
          console.log("AuthProvider - No session found");
          
          // If we have OAuth error parameters, clean them up
          if (hasOAuthParams && urlParams.has('error')) {
            const cleanUrl = window.location.pathname;
            router.replace(cleanUrl);
          }
        }
      } catch (error) {
        console.error("AuthProvider - Failed to restore session:", error);
      } finally {
        // Mark restoration as complete
        console.log("AuthProvider - Restoration complete");
        setIsRestored(true);
      }
    };

    restoreSession();
  }, [setUser, setSession, router]);

  // Don't render children until auth is restored
  if (!isRestored) {
    return null;
  }

  return <>{children}</>;
}
