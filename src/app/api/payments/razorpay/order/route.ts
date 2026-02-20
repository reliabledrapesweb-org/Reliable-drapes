import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import {
  createRazorpayOrder,
  getRazorpayPublicKey,
  toPaise,
} from "@/lib/payments/razorpay";

export const runtime = "nodejs";

const requestSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const admin = getAdminSupabase();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id, user_id, total, payment_amount, payment_currency, payment_order_id, payment_status",
      )
      .eq("id", parsed.data.orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    if (order.payment_status === "captured") {
      return NextResponse.json(
        { success: false, error: "Order is already paid" },
        { status: 409 },
      );
    }

    const amount = Number(order.payment_amount ?? order.total ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 },
      );
    }

    const publicKey = getRazorpayPublicKey();
    if (!publicKey) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured" },
        { status: 500 },
      );
    }

    let razorpayOrderId = order.payment_order_id;
    if (!razorpayOrderId) {
      const createdOrder = await createRazorpayOrder({
        amount: toPaise(amount),
        currency: order.payment_currency || "INR",
        receipt: `order_${order.id.slice(0, 12)}`,
        notes: {
          app_order_id: order.id,
          user_id: user.id,
        },
      });

      razorpayOrderId = createdOrder.id;

      await admin
        .from("orders")
        .update({
          payment_order_id: createdOrder.id,
          payment_currency: createdOrder.currency,
          payment_amount: amount,
        })
        .eq("id", order.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        key: publicKey,
        orderId: order.id,
        razorpayOrderId,
        amount: toPaise(amount),
        currency: order.payment_currency || "INR",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
