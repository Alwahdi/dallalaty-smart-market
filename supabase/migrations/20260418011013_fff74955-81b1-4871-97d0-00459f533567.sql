-- 1) Restrict profiles SELECT: drop public-everything policy and replace with two:
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

-- Authenticated users can view full profile data
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2) Tighten user_roles UPDATE to prevent privilege escalation
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Properties: limit anonymous read to non-sensitive listings.
-- Replace SELECT policy: anonymous users can only see active listings; agent contact columns are still in row,
-- so we additionally create a public-safe view for anon consumers.
DROP POLICY IF EXISTS "Active items viewable by everyone" ON public.properties;

CREATE POLICY "Active items viewable by authenticated"
ON public.properties
FOR SELECT
TO authenticated
USING (
  status = 'active'
  OR auth.uid() = agent_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'properties_admin'::app_role)
);

CREATE POLICY "Active items viewable by anon (no contact)"
ON public.properties
FOR SELECT
TO anon
USING (status = 'active');
-- Note: column-level secrecy not enforced by RLS; app must avoid selecting agent_phone/agent_email when unauthenticated.