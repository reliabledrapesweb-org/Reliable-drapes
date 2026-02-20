-- Add payment tracking fields to orders for Razorpay integration
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'created'
  CHECK (payment_status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS payment_order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_signature TEXT,
ADD COLUMN IF NOT EXISTS payment_error_code TEXT,
ADD COLUMN IF NOT EXISTS payment_error_description TEXT,
ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_orders_payment_order_id ON orders(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Store webhook and gateway events for audit + idempotency
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  event_type TEXT NOT NULL,
  provider_event_id TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_provider_event
ON payment_events(provider, provider_event_id)
WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON payment_events(order_id);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment events"
  ON payment_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
