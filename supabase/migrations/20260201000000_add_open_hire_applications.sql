-- Add open hire support to job_applications table
-- This allows candidates to apply even when no specific job matches their skills

-- Add application_type column to distinguish between specific job and open hire
ALTER TABLE public.job_applications
ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'specific'
CHECK (application_type IN ('specific', 'open'));

-- Add desired_role column for open hire applications to specify what role they're interested in
ALTER TABLE public.job_applications
ADD COLUMN IF NOT EXISTS desired_role TEXT;

-- Modify job_id constraint to allow NULL for open hire applications
-- First, drop the existing NOT NULL constraint if it exists
ALTER TABLE public.job_applications
ALTER COLUMN job_id DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.job_applications.application_type IS 'Type of application: specific (for a listed job) or open (general application)';
COMMENT ON COLUMN public.job_applications.desired_role IS 'For open hire applications, the role the candidate is interested in';

-- Update the RLS policy to allow inserts for open hire applications
-- The existing policy "Anyone can submit job applications" already allows all inserts
-- No changes needed there
