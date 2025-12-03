"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { authSignupSchema, authLoginSchema } from "@/lib/validators";
import type { AuthResponse } from "@/lib/types";
import { redirect } from "next/navigation";

export async function signupAction(
  formData: FormData | { email: string; password: string; full_name?: string },
): Promise<AuthResponse> {
  // Extract data from FormData or object
  const data =
    formData instanceof FormData ? Object.fromEntries(formData) : formData;

  // Validate input
  const parse = authSignupSchema.safeParse(data);
  if (!parse.success) {
    console.error("Signup validation failed:", parse.error.flatten());
    return {
      success: false,
      error: "Invalid signup payload",
      details: parse.error.flatten(),
    };
  }

  const { email, password, full_name } = parse.data;
  console.log("Creating user with email:", email);
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
    console.error("Failed to create user:", {
      code: createErr.code,
      message: createErr.message,
      status: createErr.status,
    });
    return {
      success: false,
      error: createErr.message || "Failed to create user",
      details: createErr.message,
    };
  }

  const userId = created.user?.id;
  if (!userId) {
    console.error("User created but no ID returned");
    return {
      success: false,
      error: "User created but no id returned",
    };
  }

  console.log("User created successfully with ID:", userId);

  // Upsert profile row
  const { error: upsertErr } = await admin
    .from("profiles")
    .upsert({ id: userId, full_name: full_name ?? null }, { onConflict: "id" });

  if (upsertErr) {
    // Log but don't fail - profile creation is not critical
    console.error("Profile upsert error", {
      code: upsertErr.code,
      message: upsertErr.message,
    });
  }

  return {
    success: true,
    message: "User created successfully",
    userId,
    user: created.user ? {
      id: created.user.id,
      email: created.user.email || '',
      full_name: (created.user.user_metadata?.full_name as string) || undefined,
    } : undefined,
  };
}

export async function forgotPasswordAction(
  email: string,
): Promise<AuthResponse> {
  const anon = getAnonSupabase();

  const { error } = await anon.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: "Failed to send reset email",
      details: error.message,
    };
  }

  return {
    success: true,
    message: "Check your email for password reset link",
  };
}

export async function resetPasswordAction(
  newPassword: string,
): Promise<AuthResponse> {
  const anon = getAnonSupabase();

  const { data, error } = await anon.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      error: "Failed to reset password",
      details: error.message,
    };
  }

  return {
    success: true,
    message: "Password reset successfully",
  };
}
export async function loginAction(
  formData: FormData | { email: string; password: string },
): Promise<AuthResponse> {
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
    user: authData.user ? {
      id: authData.user.id,
      email: authData.user.email || '',
      full_name: (authData.user.user_metadata?.full_name as string) || undefined,
    } : undefined,
    session: authData.session ? {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token || '',
      expires_at: authData.session.expires_at,
      user: authData.user ? {
        id: authData.user.id,
        email: authData.user.email || '',
        full_name: (authData.user.user_metadata?.full_name as string) || undefined,
      } : {
        id: '',
        email: '',
      },
    } : undefined,
  };
}
