-- Fix search_path for has_category_role function to be more secure
CREATE OR REPLACE FUNCTION public.has_category_role(_user_id uuid, _category text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.category_roles cr
    JOIN public.categories c ON c.id = cr.category_id
    WHERE cr.user_id = _user_id
      AND c.slug = _category
      AND cr.role = _role
  )
$$;