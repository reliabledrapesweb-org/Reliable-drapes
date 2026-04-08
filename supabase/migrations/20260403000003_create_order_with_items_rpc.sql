-- Atomic order + order_items creation wrapped in a single transaction.
-- Called via supabase.rpc('create_order_with_items', { ... }) to guarantee
-- both inserts succeed or neither does — no manual rollback needed.

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_user_id UUID,
  p_status TEXT,
  p_total NUMERIC,
  p_coupon_code TEXT DEFAULT NULL,
  p_discount_amount NUMERIC DEFAULT 0,
  p_payment_provider TEXT DEFAULT 'razorpay',
  p_payment_status TEXT DEFAULT 'created',
  p_payment_amount NUMERIC DEFAULT 0,
  p_payment_currency TEXT DEFAULT 'INR',
  p_payment_metadata JSONB DEFAULT '{}'::JSONB,
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order JSONB;
BEGIN
  -- Insert the order
  INSERT INTO public.orders (
    user_id, status, total, coupon_code, discount_amount,
    payment_provider, payment_status, payment_amount,
    payment_currency, payment_metadata
  ) VALUES (
    p_user_id, p_status, p_total, p_coupon_code, p_discount_amount,
    p_payment_provider, p_payment_status, p_payment_amount,
    p_payment_currency, p_payment_metadata
  )
  RETURNING id INTO v_order_id;

  -- Insert order items from the JSONB array
  INSERT INTO public.order_items (order_id, product_id, quantity, price_snapshot)
  SELECT
    v_order_id,
    (item->>'product_id')::UUID,
    (item->>'quantity')::INT,
    (item->>'price_snapshot')::NUMERIC
  FROM jsonb_array_elements(p_items) AS item;

  -- Return the created order as JSONB
  SELECT to_jsonb(o) INTO v_order
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_order;
END;
$$;
