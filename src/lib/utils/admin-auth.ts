"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function verifyAdmin() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin privileges required");
  }

  return { supabase, user };
}
