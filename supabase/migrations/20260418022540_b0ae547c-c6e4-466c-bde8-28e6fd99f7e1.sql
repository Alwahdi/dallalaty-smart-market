
-- 1. Fix notifications: remove public read access for null user_id
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix properties: hide agent contact info from non-owners/non-admins
-- Create a security definer function to check if user can see contact info
CREATE OR REPLACE FUNCTION public.can_view_agent_contact(_property_agent_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() = _property_agent_id 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'properties_admin'::app_role);
$$;

-- Update public_properties view to exclude sensitive contact info
DROP VIEW IF EXISTS public.public_properties CASCADE;
CREATE VIEW public.public_properties
WITH (security_invoker=true)
AS
SELECT 
  id,
  title,
  description,
  price,
  category,
  listing_type,
  location,
  city,
  neighborhood,
  images,
  videos,
  custom_data,
  status,
  agent_id,
  agent_name,
  created_at,
  updated_at
FROM public.properties
WHERE status = 'active';

-- 3. Fix merchant_employees policy logic
DROP POLICY IF EXISTS "Merchants manage their employees" ON public.merchant_employees;
CREATE POLICY "Merchants manage their employees"
ON public.merchant_employees
FOR ALL
TO authenticated
USING (
  (auth.uid() = merchant_id AND has_role(auth.uid(), 'merchant'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (auth.uid() = merchant_id AND has_role(auth.uid(), 'merchant'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Restrict profiles admin access - only admins can see sensitive fields
-- Create a safe public profile view (already exists as public_profiles)
-- Ensure it doesn't expose sensitive data like phone, email, GPS
DROP VIEW IF EXISTS public.public_profiles CASCADE;
CREATE VIEW public.public_profiles
WITH (security_invoker=true)
AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  bio,
  location,
  website
FROM public.profiles
WHERE is_active = true;
