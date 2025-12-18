-- Function to send welcome notification when user becomes admin
CREATE OR REPLACE FUNCTION send_admin_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if role changed to admin
  IF NEW.role = 'admin' AND (OLD.role IS NULL OR OLD.role != 'admin') THEN
    -- Insert welcome notification
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.id,
      'Welcome to Admin Dashboard',
      'You have been granted administrator access to the system. You can now manage products, orders, customers, and more.',
      'success',
      '/admin'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS admin_welcome_notification_trigger ON profiles;
CREATE TRIGGER admin_welcome_notification_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_admin_welcome_notification();

-- Add comment
COMMENT ON FUNCTION send_admin_welcome_notification() IS 'Automatically sends a welcome notification when a user becomes an admin';
