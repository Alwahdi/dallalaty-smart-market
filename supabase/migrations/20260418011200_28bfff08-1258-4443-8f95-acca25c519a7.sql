-- ============================================
-- 1) Lock down profiles: own row only
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Public-safe profile view (no email/phone/push_token/suspended_*)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT
  user_id,
  full_name,
  avatar_url,
  bio,
  location,
  website
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ============================================
-- 2) Lock down properties: remove anon access, restrict columns via view
-- ============================================
DROP POLICY IF EXISTS "Active items viewable by anon (no contact)" ON public.properties;

-- Public view: active properties only, no agent contact
CREATE OR REPLACE VIEW public.public_properties
WITH (security_invoker = true) AS
SELECT
  id, title, description, price, category, listing_type,
  location, city, neighborhood, images, videos,
  custom_data, status, created_at, updated_at,
  agent_id, agent_name
FROM public.properties
WHERE status = 'active';

GRANT SELECT ON public.public_properties TO anon, authenticated;

-- ============================================
-- 3) Storage: enforce folder ownership for property-images / property-videos
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property videos" ON storage.objects;

CREATE POLICY "Users upload own property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users update own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin'::app_role))
);

CREATE POLICY "Users upload own property videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users update own property videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own property videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-videos'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin'::app_role))
);

-- ============================================
-- 4) Notifications: restrict broadcast (user_id IS NULL) to admins or notifications_admin only
-- (SELECT policy already permits authenticated to view broadcasts which is OK — they're for everyone)
-- Tighten INSERT: non-admin can only insert for themselves
-- ============================================
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins or self can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'notifications_admin'::app_role)
  OR (auth.uid() = user_id AND user_id IS NOT NULL)
);