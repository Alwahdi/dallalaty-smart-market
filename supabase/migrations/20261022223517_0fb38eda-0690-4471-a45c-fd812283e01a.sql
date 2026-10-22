
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'properties_admin',
    'categories_admin',
    'notifications_admin',
    'moderator',
    'user',
    'merchant'
);

CREATE FUNCTION public.can_view_agent_contact(_property_agent_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT 
    auth.uid() = _property_agent_id 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'properties_admin'::app_role);
$$;

CREATE FUNCTION public.ensure_phone_unique() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.phone IS NOT NULL AND NEW.phone <> '' THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles WHERE phone = NEW.phone AND user_id <> NEW.user_id
    ) THEN
      RAISE EXCEPTION 'PHONE_ALREADY_USED' USING ERRCODE = '23505';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.get_employer_merchant_ids(_employee_id uuid) RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT merchant_id FROM public.merchant_employees WHERE employee_id = _employee_id;
$$;

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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

CREATE FUNCTION public.has_category_role(_user_id uuid, _category_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.category_roles
    WHERE user_id = _user_id AND category_id = _category_id AND role = _role
  );
$$;

CREATE FUNCTION public.has_merchant_permission(_employee_id uuid, _merchant_id uuid, _permission text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchant_employees
    WHERE employee_id = _employee_id
      AND merchant_id = _merchant_id
      AND COALESCE((permissions->>_permission)::boolean, false) = true
  );
$$;

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    subtitle text,
    description text,
    icon text,
    parent_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    custom_fields jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.category_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    role public.app_role DEFAULT 'moderator'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    property_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.merchant_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    permissions jsonb DEFAULT '{"can_add_products": true, "can_edit_products": true, "can_delete_products": false, "can_manage_employees": false}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    message text,
    type text DEFAULT 'info'::text,
    link text,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    action_url text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    phone text,
    avatar_url text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    suspended_at timestamp with time zone,
    suspended_by uuid,
    bio text,
    location text,
    website text,
    push_token text,
    latitude double precision,
    longitude double precision,
    city text
);

CREATE TABLE public.properties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid,
    title text NOT NULL,
    description text,
    price numeric DEFAULT 0 NOT NULL,
    category text NOT NULL,
    listing_type text,
    location text,
    city text,
    neighborhood text,
    images text[] DEFAULT '{}'::text[],
    videos text[] DEFAULT '{}'::text[],
    agent_name text,
    agent_phone text,
    agent_email text,
    status text DEFAULT 'pending'::text NOT NULL,
    custom_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    currency text DEFAULT 'YER'::text NOT NULL,
    CONSTRAINT properties_currency_check CHECK ((currency = ANY (ARRAY['YER'::text, 'SAR'::text, 'USD'::text])))
);

CREATE VIEW public.public_profiles WITH (security_invoker='true') AS
 SELECT user_id,
    full_name,
    avatar_url,
    bio,
    location,
    website
   FROM public.profiles
  WHERE (is_active = true);

CREATE VIEW public.public_properties WITH (security_invoker='true') AS
 SELECT id,
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
  WHERE (status = 'active'::text);

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.category_roles
    ADD CONSTRAINT category_roles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.category_roles
    ADD CONSTRAINT category_roles_user_id_category_id_role_key UNIQUE (user_id, category_id, role);

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_property_id_key UNIQUE (user_id, property_id);

ALTER TABLE ONLY public.merchant_employees
    ADD CONSTRAINT merchant_employees_merchant_id_employee_id_key UNIQUE (merchant_id, employee_id);

ALTER TABLE ONLY public.merchant_employees
    ADD CONSTRAINT merchant_employees_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);

CREATE INDEX idx_properties_agent ON public.properties USING btree (agent_id);

CREATE INDEX idx_properties_category ON public.properties USING btree (category);

CREATE INDEX idx_properties_status ON public.properties USING btree (status);

CREATE UNIQUE INDEX profiles_phone_unique_idx ON public.profiles USING btree (phone) WHERE ((phone IS NOT NULL) AND (phone <> ''::text));

CREATE TRIGGER merchant_employees_updated_at BEFORE UPDATE ON public.merchant_employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER profiles_phone_unique_trg BEFORE INSERT OR UPDATE OF phone ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.ensure_phone_unique();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.category_roles
    ADD CONSTRAINT category_roles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.category_roles
    ADD CONSTRAINT category_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Active items viewable by authenticated" ON public.properties FOR SELECT TO authenticated USING (((status = 'active'::text) OR (auth.uid() = agent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'properties_admin'::public.app_role)));

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins manage categories" ON public.categories USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'categories_admin'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'categories_admin'::public.app_role)));

CREATE POLICY "Admins manage category roles" ON public.category_roles USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'categories_admin'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'categories_admin'::public.app_role)));

CREATE POLICY "Admins or self can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'notifications_admin'::public.app_role) OR ((auth.uid() = user_id) AND (user_id IS NOT NULL))));

CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

CREATE POLICY "Employees view their record" ON public.merchant_employees FOR SELECT USING ((auth.uid() = employee_id));

CREATE POLICY "Merchants manage their employees" ON public.merchant_employees TO authenticated USING ((((auth.uid() = merchant_id) AND public.has_role(auth.uid(), 'merchant'::public.app_role)) OR public.has_role(auth.uid(), 'admin'::public.app_role))) WITH CHECK ((((auth.uid() = merchant_id) AND public.has_role(auth.uid(), 'merchant'::public.app_role)) OR public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Merchants/admins/employees insert items" ON public.properties FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'properties_admin'::public.app_role) OR ((auth.uid() = agent_id) AND public.has_role(auth.uid(), 'merchant'::public.app_role)) OR public.has_merchant_permission(auth.uid(), agent_id, 'can_add_products'::text)));

CREATE POLICY "Owners/admins/employees delete items" ON public.properties FOR DELETE USING (((auth.uid() = agent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'properties_admin'::public.app_role) OR public.has_merchant_permission(auth.uid(), agent_id, 'can_delete_products'::text)));

CREATE POLICY "Owners/admins/employees update items" ON public.properties FOR UPDATE USING (((auth.uid() = agent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'properties_admin'::public.app_role) OR public.has_merchant_permission(auth.uid(), agent_id, 'can_edit_products'::text)));

CREATE POLICY "Users add own favorites" ON public.favorites FOR INSERT WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING ((auth.uid() = user_id));

CREATE POLICY "Users insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users remove own favorites" ON public.favorites FOR DELETE USING ((auth.uid() = user_id));

CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));

CREATE POLICY "Users update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));

CREATE POLICY "Users view own category roles" ON public.category_roles FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'categories_admin'::public.app_role)));

CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.category_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.merchant_employees ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- buckets created via storage_create_bucket tool
CREATE POLICY "Public read property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Public read property videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-videos');

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

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

DROP POLICY IF EXISTS "Public read property images" ON storage.objects;

DROP POLICY IF EXISTS "Public read property videos" ON storage.objects;

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;

CREATE POLICY "Public read property image files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images' AND name IS NOT NULL);

CREATE POLICY "Public read property video files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-videos' AND name IS NOT NULL);

CREATE POLICY "Public read avatar files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND name IS NOT NULL);

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
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin'::public.app_role))
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
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin'::public.app_role))
);

DROP POLICY IF EXISTS "Authenticated upload property images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated upload property videos" ON storage.objects;

-- ============ Data API grants (required on external Supabase) ============
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.categories, public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.properties, public.profiles, public.user_roles, public.category_roles, public.favorites, public.notifications, public.merchant_employees TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
GRANT SELECT ON public.public_profiles, public.public_properties TO anon, authenticated;
