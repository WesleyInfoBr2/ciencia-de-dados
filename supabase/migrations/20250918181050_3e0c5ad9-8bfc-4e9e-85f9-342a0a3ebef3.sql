-- Fix Function Search Path Mutable issue
-- Update existing functions to have proper search_path (without dropping them)
CREATE OR REPLACE FUNCTION public.get_user_role_in_org(_user_id uuid, _org_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.memberships 
  WHERE user_id = _user_id AND org_id = _org_id;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = _user_id AND org_id = _org_id
  );
$$;

-- Update handle_new_user function to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    username, 
    bio, 
    social_networks
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'bio', ''),
    COALESCE(
      (NEW.raw_user_meta_data ->> 'social_networks')::jsonb,
      '{}'::jsonb
    )
  );
  RETURN NEW;
END;
$$;