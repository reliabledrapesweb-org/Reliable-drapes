import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { getAnonSupabase } from "@/lib/supabaseAnon";
import { productsQuerySchema } from "@/lib/validators";
import { ControllerResult, HTTP_STATUS } from "@/lib/types/controllers";

export async function getProducts(req: Request): Promise<ControllerResult> {
  try {
    const url = new URL(req.url);
    const qs = Object.fromEntries(url.searchParams.entries());
    const parsed = productsQuerySchema.safeParse(qs);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid query params",
        details: parsed.error.format(),
        statusCode: HTTP_STATUS.BAD_REQUEST,
      };
    }
    const { page, perPage } = parsed.data;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const anon = getAnonSupabase();
    const admin = getAdminSupabase();

    let role: "customer" | "admin" = "customer";
    let userId: string | null = null;

    if (token) {
      // validate token and get user
      const { data: userData, error: userErr } = await anon.auth.getUser(token);
      if (!userErr && userData?.user?.id) {
        userId = userData.user.id;
        // fetch profile role
        const { data: profile, error: pErr } = await admin
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        if (profile && profile.role === "admin") role = "admin";
      }
      // if token invalid -> we default to 'customer' (public browsing)
    }

    // Query all products - no role-based filtering needed since only customers use the app
    // Admins can see all products, customers see all customer products
    const { data, error } = await admin
      .from("products")
      .select("*")
      .contains("visible_to", ["customer"])
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("products fetch error", error);
      return {
        success: false,
        error: "Failed to fetch products",
        details: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }

    const products = (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image_url: p.image_url,
      price: Number(p.price),
      visible_to: p.visible_to,
      created_at: p.created_at,
    }));

    return {
      success: true,
      data: {
        products,
        meta: { page, perPage, role, userId },
      },
      statusCode: HTTP_STATUS.OK,
    };
  } catch (err) {
    console.error("/api/products error", err);
    return {
      success: false,
      error: "Internal server error",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}
