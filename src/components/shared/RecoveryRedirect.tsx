"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

/**
 * Detects Supabase PASSWORD_RECOVERY events from hash fragments
 * and redirects the user to /reset-password.
 *
 * Supabase implicit flow redirects with #access_token=...&type=recovery
 * which the server never sees. This client component catches it.
 */
export function RecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check URL hash for recovery type (fallback detection)
    const hash = window.location.hash;
    if (hash.includes("type=recovery") && pathname !== "/reset-password") {
      router.replace("/reset-password" + hash);
      return;
    }

    // Listen for Supabase PASSWORD_RECOVERY auth event
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/reset-password") {
        router.replace("/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
