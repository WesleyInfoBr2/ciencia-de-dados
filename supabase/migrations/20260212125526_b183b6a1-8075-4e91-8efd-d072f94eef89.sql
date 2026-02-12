
-- 1. Allow admins to SELECT all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Allow admins to UPDATE all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Backfill missing subscriptions for existing users
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT p.id, 'gratuito', 'active'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
);

-- 4. Allow admins to view all subscriptions (already exists, but ensure user_roles is also readable by admins)
-- Check user_roles policies
CREATE POLICY "Admins can view all user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
