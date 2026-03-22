"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supabaseClient } from "@/lib/supabase/client";

/**
 * AuthProvider - Restores auth state from Supabase on app load
 * Uses server-side session check + client-side sync
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Clean up OAuth parameters from URL if present
        // The /auth/callback route has already handled the code exchange
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("code") || urlParams.has("error")) {
          router.replace(window.location.pathname);
        }

        // Check for existing session (either from OAuth or regular login)
        const { data, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (!sessionError && data.session) {
          const session = data.session;
          const user = session.user;

          if (user) {
            // Fetch profile to get avatar_url
            const { data: profile } = await supabaseClient
              .from("profiles")
              .select("avatar_url, full_name")
              .eq("id", user.id)
              .single();

            // Use profile avatar, or fallback to Google avatar from metadata
            const avatarUrl =
              profile?.avatar_url ||
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture;

            setUser({
              id: user.id,
              email: user.email || "",
              full_name:
                profile?.full_name ||
                (user.user_metadata?.full_name as string) ||
                undefined,
              avatar_url: avatarUrl || undefined,
            });

            setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token || "",
              expires_at: session.expires_at,
              user: {
                id: user.id,
                email: user.email || "",
                full_name:
                  profile?.full_name ||
                  (user.user_metadata?.full_name as string) ||
                  undefined,
                avatar_url: avatarUrl || undefined,
              },
            });
          }
        } else {
        }
      } catch (error) {

      } finally {
      }
    };

    restoreSession();
  }, [setUser, setSession, router]);

  return <>{children}</>;
}
