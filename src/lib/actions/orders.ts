"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { createOrderSchema } from "@/lib/validators";
import { createNotification } from "@/lib/actions/notifications";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Authorization required", details: error?.message };
  }

  return { userId: user.id };
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

  // Create notification for the user
  await createNotification({
    user_id: auth.userId,
    title: "Order Placed Successfully",
    message: `Your order #${orderId.slice(0, 8)} has been placed successfully.`,
    type: "success",
    link: `/profile?tab=orders`,
  });

  // Create notification for all admin users
  try {
    const { data: adminUsers } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminUsers && adminUsers.length > 0) {
      for (const adminUser of adminUsers) {
        await createNotification({
          user_id: adminUser.id,
          title: "New Order Received",
          message: `Order #${orderId.slice(0, 8)} has been placed and requires processing.`,
          type: "info",
          link: `/admin/orders`,
        });
      }
    }
  } catch (e) {
    console.warn("Failed to create admin notifications:", e);
  }

  revalidatePath("/profile?tab=orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

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

  const supabase = await supabaseServer();

  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select(
      `
      id, status, total, created_at,
      order_items (
        id, 
        product_id, 
        quantity, 
        price_snapshot,
        product: products (
          name,
          image_url
        )
      )
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

export async function getAdminOrdersAction(
  page: number = 1,
  limit: number = 10,
  status?: string,
) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return { success: false, ...auth };

  const admin = getAdminSupabase();
  const offset = (page - 1) * limit;

  // First get orders without the join to avoid FK issues
  let ordersQuery = admin
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") {
    ordersQuery = ordersQuery.eq("status", status);
  }

  const { data: ordersData, count, error: ordersError } = await ordersQuery;

  if (ordersError) {
    console.error("Admin fetch orders error:", ordersError);
    return { success: false, error: ordersError.message };
  }

  if (!ordersData || ordersData.length === 0) {
    return {
      success: true,
      orders: [],
      total: count || 0,
      page,
      limit,
    };
  }

  // Fetch order items with products for each order
  const orderIds = ordersData.map((o) => o.id);
  const { data: orderItems } = await admin
    .from("order_items")
    .select(
      `
      id,
      order_id,
      quantity,
      price_snapshot,
      product_id,
      products (name, image_url)
    `,
    )
    .in("order_id", orderIds);

  // Fetch user profiles for each order
  const userIds = [
    ...new Set(ordersData.map((o) => o.user_id).filter(Boolean)),
  ];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, city, address_line1")
    .in("id", userIds);

  // Combine data
  const ordersWithDetails = ordersData.map((order) => {
    const items = (orderItems || [])
      .filter((item: any) => item.order_id === order.id)
      .map((item: any) => ({
        ...item,
        product: item.products,
      }));
    const userProfile = profiles?.find((p) => p.id === order.user_id);
    return {
      ...order,
      order_items: items,
      user: userProfile
        ? {
            full_name: userProfile.full_name,
            city: userProfile.city,
            address_line1: userProfile.address_line1,
          }
        : null,
    };
  });

  return {
    success: true,
    orders: ordersWithDetails,
    total: count || 0,
    page,
    limit,
  };
}

export async function getOrderByIdAction(orderId: string) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return { success: false, ...auth };

  const admin = getAdminSupabase();

  const { data: order, error } = await admin
    .from("orders")
    .select(
      `
            *,
            order_items (
                *,
                product: products(name, image_url, price)
            ),
            user: profiles(full_name, phone, address_line1, city, country)
        `,
    )
    .eq("id", orderId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, order };
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return { success: false, ...auth };

  const admin = getAdminSupabase();

  const { data: updated, error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Notify user about status change
  await createNotification({
    user_id: updated.user_id,
    title: "Order Status Updated",
    message: `Your order #${orderId.slice(0, 8)} is now ${status}.`,
    type: "info",
    link: `/profile?tab=orders`,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/profile/orders");

  return { success: true, order: updated };
}

export async function getRecentOrdersAction(limit: number = 5) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return { success: false, ...auth };

  const admin = getAdminSupabase();

  const { data: orders, error } = await admin
    .from("orders")
    .select(
      `
            id, 
            status, 
            total, 
            created_at,
            user: profiles(full_name)
        `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, orders: orders || [] };
}
