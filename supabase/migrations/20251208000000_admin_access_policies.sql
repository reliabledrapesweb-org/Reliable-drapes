-- Migration to add admin RLS policies and initial admin setup
-- This allows server-side admin operations

-- Drop existing restrictive policy
drop policy if exists "Users can update their own profile" on profiles;

-- Create new policies that allow admin operations
create policy "Users can update their own profile (excluding role)"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = OLD.role);

-- Allow service role to update any profile (for admin promotion)
create policy "Service role can update any profile"
  on profiles for update
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (true);

-- Allow admins to update profiles
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
