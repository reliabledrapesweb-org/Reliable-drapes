-- Create storage bucket for job application resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-applications', 'job-applications', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files
CREATE POLICY "Public Access to job application resumes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'job-applications' );

-- Allow anyone to upload files (for job applications)
CREATE POLICY "Anyone can upload job application resumes"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'job-applications' );

-- Allow admins to delete files
CREATE POLICY "Admins can delete job application resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-applications' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
