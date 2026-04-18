
-- ============================================================
-- 1. Roles enum + has_role function
-- ============================================================
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'properties_admin',
  'categories_admin',
  'notifications_admin',
  'moderator',
  'user'
);

-- ============================================================
-- 2. Generic timestamp trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- 3. Profiles table
-- ============================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. user_roles table (separate, secure)
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer functions (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 5. Categories table (with custom_fields JSON)
-- ============================================================
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  order_index INTEGER NOT NULL DEFAULT 0,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'categories_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'categories_admin'));

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. Properties (items) table
-- ============================================================
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  listing_type TEXT,
  location TEXT,
  city TEXT,
  neighborhood TEXT,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  custom_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active items viewable by everyone"
  ON public.properties FOR SELECT
  USING (status = 'active' OR auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'properties_admin'));

CREATE POLICY "Authenticated users can insert items"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'properties_admin'));

CREATE POLICY "Owners and admins can update items"
  ON public.properties FOR UPDATE
  USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'properties_admin'));

CREATE POLICY "Owners and admins can delete items"
  ON public.properties FOR DELETE
  USING (auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'properties_admin'));

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_properties_category ON public.properties(category);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_agent ON public.properties(agent_id);

-- ============================================================
-- 7. Favorites table
-- ============================================================
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users add own favorites"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own favorites"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 8. Notifications table
-- ============================================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'notifications_admin') OR
    auth.uid() = user_id
  );

CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- ============================================================
-- 9. Auto-create profile + assign user role on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 10. Storage buckets for media
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('property-images', 'property-images', true),
  ('property-videos', 'property-videos', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for media buckets
CREATE POLICY "Public read property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Public read property videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-videos');

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users upload to property buckets in their own folder
CREATE POLICY "Authenticated upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated upload property videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own uploads"
  ON storage.objects FOR UPDATE
  USING (auth.uid() IS NOT NULL AND owner = auth.uid());

CREATE POLICY "Users delete own uploads"
  ON storage.objects FOR DELETE
  USING (auth.uid() IS NOT NULL AND owner = auth.uid());
