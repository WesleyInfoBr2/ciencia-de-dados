-- Update the handle_new_user function to handle additional profile data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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