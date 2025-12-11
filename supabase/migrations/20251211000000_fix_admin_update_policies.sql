-- Fix admin update policies to use is_admin function instead of current_setting

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;

-- Create proper admin policies using the is_admin function
CREATE POLICY "Users can update own profile or admins can update any"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own profile or admins can delete any"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id OR is_admin(auth.uid()));

-- Also add INSERT policy for completeness (in case needed for user creation)
CREATE POLICY "Users can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR is_admin(auth.uid()));