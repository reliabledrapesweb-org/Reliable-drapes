-- Add foreign key constraint between orders and profiles to enable joins
ALTER TABLE orders
ADD CONSTRAINT orders_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT orders_profiles_fkey ON orders IS 'Relationship for joining orders with user profiles';
