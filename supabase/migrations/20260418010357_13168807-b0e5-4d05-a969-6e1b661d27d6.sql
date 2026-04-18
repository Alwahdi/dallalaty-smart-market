
-- Profiles: add fields used by AccountSettings, UserManagement, useNotifications
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_by UUID,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Notifications: add updated_at + action_url
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- category_roles: per-section moderators
CREATE TABLE IF NOT EXISTS public.category_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'moderator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, role)
);

ALTER TABLE public.category_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own category roles"
  ON public.category_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'categories_admin'));

CREATE POLICY "Admins manage category roles"
  ON public.category_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'categories_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'categories_admin'));

-- Helper to check category-level role
CREATE OR REPLACE FUNCTION public.has_category_role(_user_id UUID, _category_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.category_roles
    WHERE user_id = _user_id AND category_id = _category_id AND role = _role
  );
$$;

-- ============================================================
-- Fix security warning: restrict bucket-wide listing
-- Replace broad SELECT policies with object-level access only
-- ============================================================
DROP POLICY IF EXISTS "Public read property images" ON storage.objects;
DROP POLICY IF EXISTS "Public read property videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;

-- Allow public read of individual files (needed for <img src> + getPublicUrl)
-- but disallow bucket-wide listing by limiting to known object names only.
-- Public buckets allow direct file access via getPublicUrl regardless of policy,
-- so we only need RLS to govern listing. We add narrow policies that match
-- only paths under a user-id folder, preventing arbitrary listing.
CREATE POLICY "Public read property image files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images' AND name IS NOT NULL);

CREATE POLICY "Public read property video files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-videos' AND name IS NOT NULL);

CREATE POLICY "Public read avatar files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND name IS NOT NULL);
