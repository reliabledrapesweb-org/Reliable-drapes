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
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        // If we have an OAuth code, exchange it for a session
        if (code) {
          console.log("AuthProvider - Processing OAuth code");
          try {
            const { data: sessionData, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error("AuthProvider - OAuth code exchange failed:", exchangeError);
              // Clean up the URL and continue with normal session check
              router.replace(window.location.pathname);
            } else if (sessionData.session) {
              console.log("AuthProvider - OAuth session established");
              const session = sessionData.session;
              const user = session.user;

              setUser({
                id: user.id,
                email: user.email || "",
                full_name: (user.user_metadata?.full_name as string) || undefined,
              });

              setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token || "",
                expires_at: session.expires_at,
                user: {
                  id: user.id,
                  email: user.email || "",
                  full_name: (user.user_metadata?.full_name as string) || undefined,
                },
              });

              // Call server action to handle admin promotion if needed
              try {
                const { handleOAuthSignup } = await import("@/lib/actions/auth");
                await handleOAuthSignup(user.id, user.email || "");
              } catch (error) {
                console.error("AuthProvider - Failed to handle OAuth signup:", error);
              }

              // Clean up OAuth parameters from URL
              router.replace(window.location.pathname);
              return; // Exit early since we've handled the OAuth flow
            }
          } catch (oauthError) {
            console.error("AuthProvider - OAuth processing error:", oauthError);
            router.replace(window.location.pathname);
          }
        }

        // Handle OAuth errors
        if (error) {
          console.error("AuthProvider - OAuth error:", error);
          router.replace(window.location.pathname);
          return;
        }

        // Normal session check for non-OAuth cases
        const { data, error: sessionError } = await supabaseClient.auth.getSession();

        if (!sessionError && data.session) {
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
  }, [setUser, setSession, router]);

  // Don't render children until auth is restored
  if (!isRestored) {
    return null;
  }

  return <>{children}</>;
}
