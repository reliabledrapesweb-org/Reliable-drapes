import { NextResponse } from "next/server";
import { z } from "zod";
import {
  finalizePaidOrderAction,
  markOrderPaymentFailedAction,
  recordPaymentEventAction,
} from "@/lib/actions/orders";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const requestSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
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
      .select("id, user_id, payment_order_id")
      .eq("id", parsed.data.orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    if (
      order.payment_order_id &&
      order.payment_order_id !== parsed.data.razorpay_order_id
    ) {
      return NextResponse.json(
        { success: false, error: "Payment order mismatch" },
        { status: 400 },
      );
    }

    const isSignatureValid = verifyRazorpayPaymentSignature({
      razorpay_order_id: parsed.data.razorpay_order_id,
      razorpay_payment_id: parsed.data.razorpay_payment_id,
      razorpay_signature: parsed.data.razorpay_signature,
    });

    if (!isSignatureValid) {
      await markOrderPaymentFailedAction({
        orderId: parsed.data.orderId,
        payment_order_id: parsed.data.razorpay_order_id,
        payment_id: parsed.data.razorpay_payment_id,
        error_code: "invalid_signature",
        error_description: "Signature verification failed",
      });

      await recordPaymentEventAction({
        order_id: parsed.data.orderId,
        provider: "razorpay",
        event_type: "payment.verification_failed",
        provider_event_id: parsed.data.razorpay_payment_id,
        payload: parsed.data,
      });

      return NextResponse.json(
        { success: false, error: "Signature verification failed" },
        { status: 400 },
      );
    }

    const result = await finalizePaidOrderAction(parsed.data);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, details: result.details },
        { status: 400 },
      );
    }

    await recordPaymentEventAction({
      order_id: parsed.data.orderId,
      provider: "razorpay",
      event_type: "payment.verified",
      provider_event_id: parsed.data.razorpay_payment_id,
      payload: parsed.data,
    });

    return NextResponse.json({
      success: true,
      order: result.order,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to verify payment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
