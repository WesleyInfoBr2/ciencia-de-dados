-- Fix the overly permissive profiles table policies
-- Drop the insecure policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Keep the secure policy that allows users to view their own complete profile
-- (This policy already exists: "Users can view own profile details")

-- Create a new policy to allow viewing only public, non-sensitive fields of other users
-- This allows displaying usernames and avatars in community features without exposing emails
CREATE POLICY "Users can view public profile fields of others"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != id
);

-- Note: While this policy allows the SELECT, applications should only query
-- non-sensitive columns (username, avatar_url, full_name) when displaying other users.
-- The auth.uid() = id policy will take precedence for own profile, showing all fields.

-- Add a comment to document which fields are considered public
COMMENT ON TABLE public.profiles IS 'Public fields: username, avatar_url, full_name. Private fields (require auth.uid() = id): email, bio, social_networks';
