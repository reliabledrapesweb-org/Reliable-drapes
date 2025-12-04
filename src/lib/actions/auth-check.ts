"use server";

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Server-side auth check - runs on initial page load
 * Returns current user session from Supabase
 */
export async function getAuthSession() {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.getSession();

    console.log("Server auth check - Error:", error?.message || "none");
    console.log("Server auth check - Session exists:", !!data?.session);

    if (error || !data.session) {
      return null;
    }

    const session = data.session;
    const user = session.user;

    return {
      user: {
        id: user.id,
        email: user.email || "",
        full_name:
          (user.user_metadata?.full_name as string) || undefined,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token || "",
        expires_at: session.expires_at,
        user: {
          id: user.id,
          email: user.email || "",
          full_name:
            (user.user_metadata?.full_name as string) || undefined,
        },
      },
    };
  } catch (error) {
    console.error("Failed to get auth session:", error);
    return null;
  }
}
