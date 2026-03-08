-- Drop original FK to auth.users
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Add FK to profiles instead
ALTER TABLE orders
ADD CONSTRAINT orders_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT orders_profiles_fkey ON orders IS 'Relationship for joining orders with user profiles';
