"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createNotification } from "@/lib/actions/notifications";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

const SHIPPING_FREE_THRESHOLD = 5000;
const DEFAULT_SHIPPING_FEE = 50;
const DEFAULT_CURRENCY = "INR";

const pendingOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
});

const legacyCreateOrderSchema = z.object({
  total: z.number().nonnegative("Total must be non-negative").optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        price: z.number().nonnegative().optional(),
      }),
    )
    .optional()
    .default([]),
});

type PricedOrderItem = {
  product_id: string;
  quantity: number;
  price_snapshot: number;
};

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

async function calculateOrderPricing(items: PricedOrderItem[]) {
  const admin = getAdminSupabase();
  const uniqueProductIds = [...new Set(items.map((item) => item.product_id))];

  const { data: products, error } = await admin
    .from("products")
    .select("id, price")
    .in("id", uniqueProductIds);

  if (error) {
    return {
      success: false as const,
      error: "Failed to fetch products for pricing",
      details: error.message,
    };
  }

  const productPriceMap = new Map<string, number>();
  for (const product of products || []) {
    productPriceMap.set(product.id, Number(product.price ?? 0));
  }

  const missingProducts = uniqueProductIds.filter((id) => !productPriceMap.has(id));
  if (missingProducts.length > 0) {
    return {
      success: false as const,
      error: "Some products are no longer available",
      details: { missingProducts },
    };
  }

  const pricedItems: PricedOrderItem[] = items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price_snapshot: productPriceMap.get(item.product_id) ?? 0,
  }));

  const subtotal = pricedItems.reduce(
    (sum, item) => sum + item.price_snapshot * item.quantity,
    0,
  );
  const shipping = subtotal > SHIPPING_FREE_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  const total = subtotal + shipping;

  return {
    success: true as const,
    pricing: {
      subtotal,
      shipping,
      total,
      currency: DEFAULT_CURRENCY,
      pricedItems,
    },
  };
}

async function createOrderNotifications(orderId: string, userId: string) {
  await createNotification({
    user_id: userId,
    title: "Order Placed Successfully",
    message: `Your order #${orderId.slice(0, 8)} has been placed successfully.`,
    type: "success",
    link: `/profile?tab=orders`,
  });

  try {
    const admin = getAdminSupabase();
    const { data: adminUsers } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminUsers && adminUsers.length > 0) {
      for (const adminUser of adminUsers) {
        await createNotification({
          user_id: adminUser.id,
          title: "New Paid Order Received",
          message: `Order #${orderId.slice(0, 8)} has been paid and requires processing.`,
          type: "info",
          link: `/admin/orders`,
        });
      }
    }
  } catch {
    // Keep payment/order flow resilient to notification issues.
  }
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/cart");
  revalidatePath("/profile?tab=orders");
  revalidatePath("/profile/orders");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function createPendingOrderAction(data: {
  items: Array<{ product_id: string; quantity: number }>;
}) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) {
    return { success: false, ...auth };
  }

  const parsed = pendingOrderSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid order payload",
      details: parsed.error.flatten(),
    };
  }

  const pricingResult = await calculateOrderPricing(
    parsed.data.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_snapshot: 0,
    })),
  );

  if (!pricingResult.success) {
    return { success: false, ...pricingResult };
  }

  const { pricing } = pricingResult;
  const admin = getAdminSupabase();

  const { data: inserted, error: insertErr } = await admin
    .from("orders")
    .insert({
      user_id: auth.userId,
      status: "pending",
      total: pricing.total,
      payment_provider: "razorpay",
      payment_status: "created",
      payment_amount: pricing.total,
      payment_currency: pricing.currency,
      payment_metadata: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
      },
    })
    .select()
    .single();

  if (insertErr || !inserted?.id) {
    return {
      success: false,
      error: "Failed to create order",
      details: insertErr?.message,
    };
  }

  const { error: itemInsertErr } = await admin.from("order_items").insert(
    pricing.pricedItems.map((item) => ({
      order_id: inserted.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_snapshot: item.price_snapshot,
    })),
  );

  if (itemInsertErr) {
    await admin.from("orders").delete().eq("id", inserted.id);

    return {
      success: false,
      error: "Failed to create order items",
      details: itemInsertErr.message,
    };
  }

  revalidateOrderPaths(inserted.id);

  return {
    success: true,
    message: "Pending order created",
    orderId: inserted.id,
    order: inserted,
    pricing,
  };
}

// Backward-compatible wrapper for the previous checkout flow.
export async function createOrderAction(data: {
  total: number;
  items?: Array<{ product_id: string; quantity: number; price?: number }>;
}) {
  const parsed = legacyCreateOrderSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid order payload",
      details: parsed.error.flatten(),
    };
  }

  return createPendingOrderAction({
    items: parsed.data.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
  });
}

export async function finalizePaidOrderAction(data: {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string | null;
}) {
  const admin = getAdminSupabase();

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, user_id, status, payment_status, payment_order_id")
    .eq("id", data.orderId)
    .single();

  if (orderErr || !order) {
    return {
      success: false,
      error: "Order not found",
      details: orderErr?.message,
    };
  }

  if (order.payment_order_id && order.payment_order_id !== data.razorpay_order_id) {
    return {
      success: false,
      error: "Payment order mismatch",
    };
  }

  const alreadyCaptured = order.payment_status === "captured";

  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({
      status: "processing",
      payment_status: "captured",
      payment_order_id: data.razorpay_order_id,
      payment_id: data.razorpay_payment_id,
      payment_signature: data.razorpay_signature ?? null,
      payment_error_code: null,
      payment_error_description: null,
      payment_captured_at: new Date().toISOString(),
    })
    .eq("id", data.orderId)
    .select()
    .single();

  if (updateError) {
    return {
      success: false,
      error: "Failed to finalize paid order",
      details: updateError.message,
    };
  }

  if (!alreadyCaptured && order.user_id) {
    await createOrderNotifications(data.orderId, order.user_id);
  }

  revalidateOrderPaths(data.orderId);

  return {
    success: true,
    order: updated,
  };
}

export async function markOrderPaymentFailedAction(data: {
  orderId: string;
  payment_order_id?: string | null;
  payment_id?: string | null;
  error_code?: string | null;
  error_description?: string | null;
}) {
  const admin = getAdminSupabase();

  const { data: updated, error } = await admin
    .from("orders")
    .update({
      payment_status: "failed",
      payment_order_id: data.payment_order_id ?? null,
      payment_id: data.payment_id ?? null,
      payment_error_code: data.error_code ?? null,
      payment_error_description: data.error_description ?? null,
    })
    .eq("id", data.orderId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Failed to update failed payment state",
      details: error.message,
    };
  }

  revalidateOrderPaths(data.orderId);
  return { success: true, order: updated };
}

export async function recordPaymentEventAction(data: {
  order_id?: string | null;
  provider: string;
  event_type: string;
  provider_event_id?: string | null;
  payload: Record<string, unknown>;
}) {
  const admin = getAdminSupabase();

  const { error } = await admin.from("payment_events").insert({
    order_id: data.order_id ?? null,
    provider: data.provider,
    event_type: data.event_type,
    provider_event_id: data.provider_event_id ?? null,
    payload: data.payload,
  });

  // Ignore duplicate provider_event_id writes (idempotency).
  if (error && error.code !== "23505") {
    return {
      success: false,
      error: "Failed to record payment event",
      details: error.message,
    };
  }

  return { success: true };
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
      payment_status, payment_amount, payment_currency, payment_id,
      tracking_number, tracking_url, expected_delivery_date, current_location, invoice_url,
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

  const userIds = [...new Set(ordersData.map((o) => o.user_id).filter(Boolean))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, city, address_line1")
    .in("id", userIds);

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
            )
        `,
    )
    .eq("id", orderId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, phone, address_line1, city, country")
    .eq("id", order.user_id)
    .single();

  return {
    success: true,
    order: {
      ...order,
      user: profile || {
        full_name: "Guest",
        phone: "N/A",
        address_line1: "N/A",
        city: "N/A",
        country: "N/A",
      },
    },
  };
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
            payment_status,
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

export async function updateOrderTrackingAction(
  orderId: string,
  data: {
    tracking_number?: string;
    tracking_url?: string;
    expected_delivery_date?: string;
    current_location?: string;
    invoice_url?: string;
  },
) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return { success: false, ...auth };

  const admin = getAdminSupabase();

  const { data: updated, error } = await admin
    .from("orders")
    .update(data)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.tracking_number || data.expected_delivery_date) {
    await createNotification({
      user_id: updated.user_id,
      title: "Order Tracking Updated",
      message: `Tracking information for your order #${orderId.slice(0, 8)} has been updated.`,
      type: "info",
      link: `/profile?tab=orders`,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/profile/orders");

  return { success: true, order: updated };
}
