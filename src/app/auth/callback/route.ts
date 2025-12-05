import { getAnonSupabase } from "@/lib/supabase/anon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = getAnonSupabase();
    
    try {
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("OAuth session exchange error:", error);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }

      // Redirect to home page on success
      return NextResponse.redirect(new URL("/", requestUrl.origin));
    } catch (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(
        new URL("/login?error=Authentication failed", requestUrl.origin)
      );
    }
  }

  // No code provided
  return NextResponse.redirect(
    new URL("/login?error=No authentication code provided", requestUrl.origin)
  );
}
