-- Add phone_prompt_dismissed_count column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_prompt_dismissed_count integer NOT NULL DEFAULT 0;
