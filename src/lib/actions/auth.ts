"use server";

import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { getAnonSupabase } from "@/lib/supabaseAnon";
import { authSignupSchema, authLoginSchema } from "@/lib/validators";

export async function signupAction(
  formData: FormData | { email: string; password: string; full_name?: string },
) {
  // Extract data from FormData or object
  const data =
    formData instanceof FormData ? Object.fromEntries(formData) : formData;

  // Validate input
  const parse = authSignupSchema.safeParse(data);
  if (!parse.success) {
    return {
      success: false,
      error: "Invalid signup payload",
      details: parse.error.flatten(),
    };
  }

  const { email, password, full_name } = parse.data;
  const admin = getAdminSupabase();

  // Create user via admin API
  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true,
    },
  );

  if (createErr) {
    return {
      success: false,
      error: "Failed to create user",
      details: createErr.message,
    };
  }

  const userId = created.user?.id;
  if (!userId) {
    return {
      success: false,
      error: "User created but no id returned",
    };
  }

  // Upsert profile row
  const { error: upsertErr } = await admin
    .from("profiles")
    .upsert({ id: userId, full_name: full_name ?? null }, { onConflict: "id" });

  if (upsertErr) {
    // Log but don't fail - profile creation is not critical
    console.error("profile upsert error", upsertErr);
  }

  return {
    success: true,
    message: "User created successfully",
    userId,
    user: created.user,
  };
}

export async function loginAction(
  formData: FormData | { email: string; password: string },
) {
  // Extract data from FormData or object
  const data =
    formData instanceof FormData ? Object.fromEntries(formData) : formData;

  // Validate input
  const parse = authLoginSchema.safeParse(data);
  if (!parse.success) {
    return {
      success: false,
      error: "Invalid login payload",
      details: parse.error.flatten(),
    };
  }

  const anon = getAnonSupabase();
  const { data: authData, error } = await anon.auth.signInWithPassword({
    email: parse.data.email,
    password: parse.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Login failed",
      details: error.message,
    };
  }

  return {
    success: true,
    message: "Logged in successfully",
    user: authData.user,
    session: authData.session,
  };
}
