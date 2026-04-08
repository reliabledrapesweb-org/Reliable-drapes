-- Add missing index on orders.user_id for faster per-user order lookups.
-- This column is filtered in getOrdersAction, getAdminOrdersAction, and RLS policies.

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
