-- Fix RLS policies to prevent infinite recursion

-- Drop existing problematic policies on catalogues
DROP POLICY IF EXISTS "Anyone can view active catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Admins can insert catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Admins can update catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Admins can delete catalogues" ON public.catalogues;

-- Temporarily disable RLS on catalogues for development
ALTER TABLE public.catalogues DISABLE ROW LEVEL SECURITY;

-- Fix profiles policies to prevent recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create simpler admin policies that don't cause recursion
CREATE POLICY "Users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR auth.jwt() ->> 'email' = ANY(string_to_array(current_setting('app.admin_emails', true), ',')));

CREATE POLICY "Users can delete profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id OR auth.jwt() ->> 'email' = ANY(string_to_array(current_setting('app.admin_emails', true), ',')));