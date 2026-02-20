import { NextResponse } from "next/server";
import {
  finalizePaidOrderAction,
  markOrderPaymentFailedAction,
  recordPaymentEventAction,
} from "@/lib/actions/orders";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

type RazorpayWebhookPayload = {
  id?: string;
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, any> };
    order?: { entity?: Record<string, any> };
  };
};

async function findOrderIdForWebhook(payload: RazorpayWebhookPayload) {
  const admin = getAdminSupabase();
  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;

  const paymentOrderId = paymentEntity?.order_id || orderEntity?.id;
  const paymentId = paymentEntity?.id;

  if (paymentOrderId) {
    const { data } = await admin
      .from("orders")
      .select("id")
      .eq("payment_order_id", paymentOrderId)
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  if (paymentId) {
    const { data } = await admin
      .from("orders")
      .select("id")
      .eq("payment_id", paymentId)
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing webhook signature" },
        { status: 400 },
      );
    }

    const rawBody = await request.text();
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const eventType = payload.event || "unknown";
    const providerEventId = payload.id || null;
    const paymentEntity = payload.payload?.payment?.entity || {};

    const orderId = await findOrderIdForWebhook(payload);
    await recordPaymentEventAction({
      order_id: orderId,
      provider: "razorpay",
      event_type: eventType,
      provider_event_id: providerEventId,
      payload: payload as unknown as Record<string, unknown>,
    });

    if (!orderId) {
      return NextResponse.json({ success: true, ignored: true });
    }

    if (eventType === "payment.captured") {
      await finalizePaidOrderAction({
        orderId,
        razorpay_order_id: paymentEntity.order_id,
        razorpay_payment_id: paymentEntity.id,
        razorpay_signature: null,
      });
    }

    if (eventType === "payment.authorized") {
      const admin = getAdminSupabase();
      await admin
        .from("orders")
        .update({
          payment_status: "authorized",
          payment_order_id: paymentEntity.order_id || null,
          payment_id: paymentEntity.id || null,
          payment_error_code: null,
          payment_error_description: null,
        })
        .eq("id", orderId);
    }

    if (eventType === "payment.failed") {
      await markOrderPaymentFailedAction({
        orderId,
        payment_order_id: paymentEntity.order_id || null,
        payment_id: paymentEntity.id || null,
        error_code: paymentEntity.error_code || "payment_failed",
        error_description:
          paymentEntity.error_description || "Payment failed at gateway",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
