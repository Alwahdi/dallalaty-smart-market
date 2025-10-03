-- Update existing NULL phone values to a default placeholder
UPDATE public.profiles 
SET phone = '0000000000' 
WHERE phone IS NULL;

-- Now make phone number mandatory
ALTER TABLE public.profiles 
ALTER COLUMN phone SET NOT NULL;

-- Create helper function to check category-specific access
CREATE OR REPLACE FUNCTION public.has_category_role(_user_id uuid, _category text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- Drop existing policies for properties that we need to update
DROP POLICY IF EXISTS "Agents can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Properties admins can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Properties admins can update properties" ON public.properties;
DROP POLICY IF EXISTS "Properties admins can delete properties" ON public.properties;

-- Create new policies with category-specific access
CREATE POLICY "Category managers can insert properties in their categories"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_category_role(auth.uid(), category, 'moderator'::app_role) OR
  public.has_role(auth.uid(), 'properties_admin'::app_role) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Category managers can update properties in their categories"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  public.has_category_role(auth.uid(), category, 'moderator'::app_role) OR
  public.has_role(auth.uid(), 'properties_admin'::app_role) OR
  public.is_admin(auth.uid()) OR
  (auth.uid())::text = agent_id
)
WITH CHECK (
  public.has_category_role(auth.uid(), category, 'moderator'::app_role) OR
  public.has_role(auth.uid(), 'properties_admin'::app_role) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Category managers can delete properties in their categories"
ON public.properties
FOR DELETE
TO authenticated
USING (
  public.has_category_role(auth.uid(), category, 'moderator'::app_role) OR
  public.has_role(auth.uid(), 'properties_admin'::app_role) OR
  public.is_admin(auth.uid())
);