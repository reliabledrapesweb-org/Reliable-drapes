import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { getAnonSupabase } from "@/lib/supabaseAnon";
import { authSignupSchema, authLoginSchema } from "@/lib/validators";
import { ControllerResult, HTTP_STATUS } from "@/lib/types/controllers";

export async function signup(body: any): Promise<ControllerResult> {
  const parse = authSignupSchema.safeParse(body);
  if (!parse.success) {
    return {
      success: false,
      error: "Invalid signup payload",
      details: parse.error.format(),
      statusCode: HTTP_STATUS.BAD_REQUEST,
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
    }
  );

  if (createErr) {
    return {
      success: false,
      error: "Failed to create user",
      details: createErr.message,
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  const userId = created.user?.id;
  if (!userId) {
    return {
      success: false,
      error: "User created but no id returned",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
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
    data: {
      message: "User created successfully",
      userId,
      user: created.user,
    },
    statusCode: HTTP_STATUS.CREATED,
  };
}

export async function login(body: any): Promise<ControllerResult> {
  const parse = authLoginSchema.safeParse(body);
  if (!parse.success) {
    return {
      success: false,
      error: "Invalid login payload",
      details: parse.error.format(),
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  const anon = getAnonSupabase();
  const { data, error } = await anon.auth.signInWithPassword({
    email: parse.data.email,
    password: parse.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Login failed",
      details: error.message,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    };
  }

  return {
    success: true,
    data: {
      message: "Logged in successfully",
      user: data.user,
      session: data.session,
    },
    statusCode: HTTP_STATUS.OK,
  };
}
