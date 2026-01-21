-- Add trial tracking column to profiles table
ALTER TABLE public.profiles
ADD COLUMN trial_started_at timestamp with time zone DEFAULT NULL;