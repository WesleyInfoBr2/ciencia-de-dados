-- Fix the broken RLS policy on organizations table
-- Drop the existing broken policy
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;

-- Create the correct policy with proper membership check
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.memberships 
    WHERE memberships.org_id = organizations.id 
      AND memberships.user_id = auth.uid()
  )
);
