"use server";

import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { getAnonSupabase } from "@/lib/supabaseAnon";
import { createOrderSchema } from "@/lib/validators";
import { cookies } from "next/headers";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  if (!token) {
    return { error: "Authorization required" };
  }

  const anon = getAnonSupabase();
  const { data: userData, error: userErr } = await anon.auth.getUser(token);

  if (userErr || !userData?.user?.id) {
    return { error: "Invalid token", details: userErr?.message };
  }

  return { userId: userData.user.id };
}

export async function createOrderAction(data: {
  total: number;
  items?: Array<{ product_id: string; quantity: number; price?: number }>;
}) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) {
    return { success: false, ...auth };
  }

  const parsed = createOrderSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid order payload",
      details: parsed.error.flatten(),
    };
  }

  const { total, items } = parsed.data;
  const admin = getAdminSupabase();

  const { data: inserted, error: insertErr } = await admin
    .from("orders")
    .insert({ user_id: auth.userId, total, status: "pending" })
    .select()
    .single();

  if (insertErr || !inserted?.id) {
    console.error("order insert err", insertErr);
    return {
      success: false,
      error: "Failed to create order",
      details: insertErr?.message,
    };
  }

  const orderId = inserted.id;

  if (Array.isArray(items) && items.length > 0) {
    try {
      await admin.from("order_items").insert(
        items.map((it: any) => ({
          order_id: orderId,
          product_id: it.product_id,
          quantity: it.quantity,
          price_snapshot: it.price ?? null,
        })),
      );
    } catch (e) {
      console.warn("order_items insert failed (non-fatal)", e);
    }
  }

  return {
    success: true,
    message: "Order created successfully",
    orderId,
    order: inserted,
  };
}

export async function getOrdersAction() {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) {
    return { success: false, ...auth };
  }

  const anon = getAnonSupabase();

  const { data: orders, error: ordersErr } = await anon
    .from("orders")
    .select(
      `
      id, status, total, created_at,
      order_items (id, product_id, quantity, price_snapshot)
    `,
    )
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (ordersErr) {
    console.error("orders fetch err", ordersErr);
    return {
      success: false,
      error: "Failed to fetch orders",
      details: ordersErr.message,
    };
  }

  return {
    success: true,
    orders: orders ?? [],
    userId: auth.userId,
  };
}
