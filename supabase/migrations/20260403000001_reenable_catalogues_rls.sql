-- Re-enable RLS on catalogues table and add proper policies
-- The previous migration (20251210000002) disabled RLS as a workaround for recursion.
-- This migration adds non-recursive policies so RLS can be safely re-enabled.

ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Admins can manage catalogues" ON public.catalogues;

-- Anyone can read active catalogues (public storefront)
CREATE POLICY "Anyone can view active catalogues"
  ON public.catalogues
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins can do everything via service_role key (bypasses RLS).
-- For authenticated admin access, match on JWT email.
CREATE POLICY "Admins can manage catalogues"
  ON public.catalogues
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = ANY(
      string_to_array(current_setting('app.admin_emails', true), ',')
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = ANY(
      string_to_array(current_setting('app.admin_emails', true), ',')
    )
  );
