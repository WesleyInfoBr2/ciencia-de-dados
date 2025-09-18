-- Add additional profile fields
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN social_networks JSONB DEFAULT '{}'::jsonb;

-- Create index for username search
CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- Add constraint to ensure username format if provided
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR 
  (username ~ '^[a-zA-Z0-9_]{3,30}$')
);

-- Update the handle_new_user function to extract additional data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  RETURN NEW;
END;
$$;