-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  experience TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Store', 'Corporate', 'Design', 'Warehouse')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs table
-- Allow everyone to read active jobs
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs
  FOR SELECT
  USING (is_active = true);

-- Allow admins to do everything with jobs
CREATE POLICY "Admins can do everything with jobs"
  ON public.jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for job_applications table
-- Allow anyone to insert applications (public submissions)
CREATE POLICY "Anyone can submit job applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to view all applications
CREATE POLICY "Admins can view all job applications"
  ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update and delete applications
CREATE POLICY "Admins can update job applications"
  ON public.job_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete job applications"
  ON public.job_applications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert mock job data
INSERT INTO public.jobs (title, experience, location, type, description, is_active) VALUES
  (
    'Senior Sales Advisor/ Sales Advisor',
    '2 - 4 yrs',
    'Mumbai(Andheri), Bangalore and Delhi',
    'Store',
    'Responsible for individual targets, to follow SOP''s & VM standards in the store Customer service, Customer acquisition & retention Follow up with backend team and customers for timely execution of orders and receivables',
    true
  ),
  (
    'Stylist (Freelance Stylists)',
    '2 - 4 yrs',
    'Mumbai, Chennai, Bangalore, Delhi, Pune, Hyderabad',
    'Store',
    'Exceptional designer with strong conceptual skills',
    true
  ),
  (
    'Marketing Manager',
    '3 - 6 yrs',
    'Mumbai, Delhi',
    'Corporate',
    'Lead marketing campaigns and brand strategy initiatives. Develop and execute comprehensive marketing plans to drive brand awareness and customer engagement.',
    true
  ),
  (
    'Interior Designer',
    '2 - 5 yrs',
    'All Major Cities',
    'Design',
    'Create stunning interior designs for residential and commercial spaces. Work closely with clients to understand their vision and deliver exceptional design solutions.',
    true
  ),
  (
    'Warehouse Manager',
    '5 - 8 yrs',
    'Mumbai, Bangalore',
    'Warehouse',
    'Oversee warehouse operations, inventory management, and logistics. Ensure efficient storage and distribution of premium home furnishing products.',
    true
  ),
  (
    'Digital Marketing Specialist',
    '1 - 3 yrs',
    'Mumbai',
    'Corporate',
    'Manage social media, SEO, and digital advertising campaigns. Create engaging content and analyze performance metrics to drive online growth.',
    true
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
