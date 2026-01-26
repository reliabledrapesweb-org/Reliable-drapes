import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {

        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }

      // If this is a password recovery flow, redirect to reset password page
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/reset-password", requestUrl.origin));
      }

      // Handle admin promotion for OAuth users
      if (data.user) {
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        const userEmail = data.user.email?.toLowerCase();

        if (userEmail && adminEmails.includes(userEmail)) {
          // Use admin client to ensure profile exists and promote to admin
          const { getAdminSupabase } = await import("@/lib/supabase/admin");
          const adminSupabase = getAdminSupabase();

          // Upsert profile with admin role
          await adminSupabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || null,
              role: "admin"
            }, { onConflict: "id" });
        }
      }

      return NextResponse.redirect(new URL("/", requestUrl.origin));
    } catch (error) {

      return NextResponse.redirect(
        new URL("/login?error=Authentication failed", requestUrl.origin)
      );
    }
  }

  // Handle hash fragments (Supabase sometimes uses these for recovery)
  // The client-side will handle this case
  return NextResponse.redirect(
    new URL("/login?error=No authentication code provided", requestUrl.origin)
  );
}