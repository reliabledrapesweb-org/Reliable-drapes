-- Function to notify admins of new job applications
CREATE OR REPLACE FUNCTION notify_admins_new_job_application()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  job_title TEXT;
BEGIN
  -- Get job title
  SELECT title INTO job_title FROM jobs WHERE id = NEW.job_id;
  
  -- Send notification to all admins
  FOR admin_record IN 
    SELECT id FROM profiles WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      admin_record.id,
      'New Job Application',
      format('New application received for %s position from %s', job_title, NEW.full_name),
      'info',
      '/admin/careers/applications'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for job applications
DROP TRIGGER IF EXISTS new_job_application_notification_trigger ON job_applications;
CREATE TRIGGER new_job_application_notification_trigger
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_job_application();

-- Function to notify admins of new contact form submissions
CREATE OR REPLACE FUNCTION notify_admins_new_contact()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Send notification to all admins
  FOR admin_record IN 
    SELECT id FROM profiles WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      admin_record.id,
      'New Contact Message',
      format('New message from %s: %s', NEW.name, LEFT(NEW.message, 50) || '...'),
      'info',
      '/admin/communications/contact'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for contact form (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions') THEN
    DROP TRIGGER IF EXISTS new_contact_notification_trigger ON contact_submissions;
    CREATE TRIGGER new_contact_notification_trigger
      AFTER INSERT ON contact_submissions
      FOR EACH ROW
      EXECUTE FUNCTION notify_admins_new_contact();
  END IF;
END $$;

-- Function to notify admins of new consultation requests
CREATE OR REPLACE FUNCTION notify_admins_new_consultation()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Send notification to all admins
  FOR admin_record IN 
    SELECT id FROM profiles WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      admin_record.id,
      'New Consultation Request',
      format('New consultation request from %s for %s', NEW.name, NEW.service_type),
      'info',
      '/admin/communications/consultations'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for consultations (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_requests') THEN
    DROP TRIGGER IF EXISTS new_consultation_notification_trigger ON consultation_requests;
    CREATE TRIGGER new_consultation_notification_trigger
      AFTER INSERT ON consultation_requests
      FOR EACH ROW
      EXECUTE FUNCTION notify_admins_new_consultation();
  END IF;
END $$;

-- Add comments
COMMENT ON FUNCTION notify_admins_new_job_application() IS 'Notifies all admins when a new job application is submitted';
COMMENT ON FUNCTION notify_admins_new_contact() IS 'Notifies all admins when a new contact form is submitted';
COMMENT ON FUNCTION notify_admins_new_consultation() IS 'Notifies all admins when a new consultation request is submitted';
