-- Add admin policies for user management

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to delete any profile (except their own)
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    AND profiles.id != auth.uid()
  );

-- Add index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add function to prevent last admin from being deleted or demoted
CREATE OR REPLACE FUNCTION prevent_last_admin_removal()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Count remaining admins
  SELECT COUNT(*) INTO admin_count
  FROM profiles
  WHERE role = 'admin'
  AND id != OLD.id;

  -- If this is the last admin, prevent the operation
  IF admin_count = 0 THEN
    RAISE EXCEPTION 'Cannot remove the last admin user';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent last admin deletion
DROP TRIGGER IF EXISTS prevent_last_admin_deletion ON profiles;
CREATE TRIGGER prevent_last_admin_deletion
  BEFORE DELETE ON profiles
  FOR EACH ROW
  WHEN (OLD.role = 'admin')
  EXECUTE FUNCTION prevent_last_admin_removal();

-- Trigger to prevent last admin demotion
DROP TRIGGER IF EXISTS prevent_last_admin_demotion ON profiles;
CREATE TRIGGER prevent_last_admin_demotion
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role = 'admin' AND NEW.role != 'admin')
  EXECUTE FUNCTION prevent_last_admin_removal();

-- Add comments for documentation
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Allows admin users to view all user profiles for management purposes';
COMMENT ON POLICY "Admins can update any profile" ON profiles IS 'Allows admin users to update any user profile including role changes';
COMMENT ON POLICY "Admins can delete profiles" ON profiles IS 'Allows admin users to delete user profiles (except their own)';
COMMENT ON FUNCTION prevent_last_admin_removal() IS 'Prevents deletion or demotion of the last admin user to maintain system access';
