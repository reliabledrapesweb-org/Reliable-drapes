-- Expand order status values to include 'processing' and 'delivered'
-- Drop the existing check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the updated check constraint with all valid status values
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'));
