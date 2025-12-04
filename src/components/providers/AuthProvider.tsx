"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { supabaseClient } from "@/lib/supabase/client";

/**
 * AuthProvider - Restores auth state from Supabase on app load
 * Uses server-side session check + client-side sync
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession } = useAuthStore();
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Client-side session check is reliable because browser has cookies
        const { data, error } = await supabaseClient.auth.getSession();
        console.log("AuthProvider - Client session check:", { hasSession: !!data?.session, error: error?.message });

        if (!error && data.session) {
          const session = data.session;
          const user = session.user;

          if (user) {
            console.log("AuthProvider - Restoring user:", user.email);
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
          }
        } else {
          console.log("AuthProvider - No session found");
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
  }, [setUser, setSession]);

  // Don't render children until auth is restored
  if (!isRestored) {
    return null;
  }

  return <>{children}</>;
}
