-- Migration to add admin RLS policies and initial admin setup
-- This allows server-side admin operations

-- Drop existing restrictive policy
drop policy if exists "Users can update their own profile" on profiles;

-- Create a trigger function to prevent users from changing their own role
create or replace function prevent_role_self_change()
returns trigger as $$
begin
  -- If the user is updating their own profile and trying to change the role
  if auth.uid() = NEW.id and OLD.role is distinct from NEW.role then
    -- Check if the current user is an admin (admins can change roles)
    if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
      NEW.role := OLD.role; -- Revert role change
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists prevent_role_self_change_trigger on profiles;
create trigger prevent_role_self_change_trigger
  before update on profiles
  for each row
  execute function prevent_role_self_change();

-- Create new policies that allow admin operations
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

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
