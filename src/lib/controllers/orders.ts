import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { getAnonSupabase } from "@/lib/supabaseAnon";
import { createOrderSchema } from "@/lib/validators";
import { ControllerResult, HTTP_STATUS } from "@/lib/types/controllers";

export async function createOrder(req: Request): Promise<ControllerResult> {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!token) {
      return {
        success: false,
        error: "Authorization required (Bearer token)",
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    const anon = getAnonSupabase();
    const admin = getAdminSupabase();

    // validate token -> get user
    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user?.id) {
      return {
        success: false,
        error: "Invalid token",
        details: userErr?.message,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid order payload",
        details: parsed.error.format(),
        statusCode: HTTP_STATUS.BAD_REQUEST,
      };
    }
    const { total, items } = parsed.data;

    // Insert order
    const { data: inserted, error: insertErr } = await admin
      .from("orders")
      .insert({ user_id: userId, total, status: "pending" })
      .select()
      .single();

    if (insertErr || !inserted?.id) {
      console.error("order insert err", insertErr);
      return {
        success: false,
        error: "Failed to create order",
        details: insertErr?.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }

    const orderId = inserted.id;

    // Insert order_items if provided
    if (Array.isArray(items) && items.length > 0) {
      try {
        await admin.from("order_items").insert(
          items.map((it: any) => ({
            order_id: orderId,
            product_id: it.product_id,
            quantity: it.quantity,
            price_snapshot: it.price ?? null,
          }))
        );
      } catch (e) {
        console.warn("order_items insert failed (non-fatal)", e);
      }
    }

    return {
      success: true,
      data: {
        message: "Order created successfully",
        orderId,
        order: inserted,
      },
      statusCode: HTTP_STATUS.CREATED,
    };
  } catch (err) {
    console.error("/api/orders error", err);
    return {
      success: false,
      error: "Internal server error",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}

export async function getOrders(req: Request): Promise<ControllerResult> {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!token) {
      return {
        success: false,
        error: "Authorization required (Bearer token)",
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    const anon = getAnonSupabase();

    // validate token -> get user
    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user?.id) {
      return {
        success: false,
        error: "Invalid token",
        details: userErr?.message,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }
    const userId = userData.user.id;

    // fetch orders with items (join on order_items)
    const { data: orders, error: ordersErr } = await anon
      .from("orders")
      .select(
        `
        id,
        status,
        total,
        created_at,
        order_items (
          id,
          product_id,
          quantity,
          price_snapshot
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (ordersErr) {
      console.error("orders fetch err", ordersErr);
      return {
        success: false,
        error: "Failed to fetch orders",
        details: ordersErr.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }

    return {
      success: true,
      data: {
        orders: orders ?? [],
        userId,
      },
      statusCode: HTTP_STATUS.OK,
    };
  } catch (err) {
    console.error("/api/orders GET error", err);
    return {
      success: false,
      error: "Internal server error",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}
