-- Fix security issue: Restrict profiles table access to authenticated users only
-- This prevents unauthorized access to user personal information (emails, names, usernames)

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new restrictive policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add policy to allow users to view only their own full profile details
CREATE POLICY "Users can view own profile details" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);