-- Create newsletter_campaigns table for storing email campaigns
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed')),
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at ON newsletter_campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage campaigns (using service role for server actions)
CREATE POLICY "Service role can manage newsletter campaigns"
  ON newsletter_campaigns
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE newsletter_campaigns IS 'Stores newsletter email campaigns sent to subscribers';