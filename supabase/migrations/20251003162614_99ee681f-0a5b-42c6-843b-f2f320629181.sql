-- Further restrict profiles access to only own profile
-- Drop the policy that still allows viewing other profiles
DROP POLICY IF EXISTS "Users can view public profile fields of others" ON public.profiles;

-- Now only two policies remain:
-- 1. "Users can view own profile details" - allows full access to own profile
-- 2. "Users can update own profile" - allows updating own profile
-- 3. "Users can insert own profile" - allows creating own profile

-- This ensures that users can ONLY see their own complete profile data.
-- No other user can harvest emails, social networks, or any other information.

-- If the application needs to display usernames/avatars of other users in community features,
-- create a dedicated function or view that exposes only those specific public fields:

CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, full_name, avatar_url
  FROM public.profiles
  WHERE username IS NOT NULL;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;

COMMENT ON FUNCTION public.get_public_profiles() IS 'Returns only public, non-sensitive profile fields (username, full_name, avatar_url) for displaying user information in community features. Does not expose email, bio, or social_networks.';
