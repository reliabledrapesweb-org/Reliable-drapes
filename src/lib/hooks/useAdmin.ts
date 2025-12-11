"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { supabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminCheckResult {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to verify if the current user has admin role
 * Redirects to home page if not admin
 */
export function useAdmin(options?: { redirectIfNotAdmin?: boolean }): AdminCheckResult {
  const { redirectIfNotAdmin = true } = options || {};
  const router = useRouter();
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user?.id) {
        setIsAdmin(false);
        setIsLoading(false);
        setError("Not authenticated");
        if (redirectIfNotAdmin) {
          router.push("/login");
        }
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw new Error(profileError.message);
        }

        const hasAdminRole = profile?.role === "admin";
        setIsAdmin(hasAdminRole);

        if (!hasAdminRole && redirectIfNotAdmin) {
          setError("Access denied: Admin privileges required");
          router.push("/");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to verify admin role";
        setError(errorMessage);
        setIsAdmin(false);
        if (redirectIfNotAdmin) {
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminRole();
  }, [user, router, redirectIfNotAdmin]);

  return { isAdmin, isLoading, error };
}
