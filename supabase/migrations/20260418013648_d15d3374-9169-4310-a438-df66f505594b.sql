
-- 1) Geo + city columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS city text;

-- 2) Phone uniqueness index
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND phone <> '';

-- 3) merchant_employees table
CREATE TABLE IF NOT EXISTS public.merchant_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{"can_add_products":true,"can_edit_products":true,"can_delete_products":false,"can_manage_employees":false}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, employee_id)
);

ALTER TABLE public.merchant_employees ENABLE ROW LEVEL SECURITY;

-- 4) Helper functions
CREATE OR REPLACE FUNCTION public.has_merchant_permission(_employee_id uuid, _merchant_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchant_employees
    WHERE employee_id = _employee_id
      AND merchant_id = _merchant_id
      AND COALESCE((permissions->>_permission)::boolean, false) = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_employer_merchant_ids(_employee_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT merchant_id FROM public.merchant_employees WHERE employee_id = _employee_id;
$$;

-- 5) Phone uniqueness trigger (friendly error)
CREATE OR REPLACE FUNCTION public.ensure_phone_unique()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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

DROP TRIGGER IF EXISTS profiles_phone_unique_trg ON public.profiles;
CREATE TRIGGER profiles_phone_unique_trg
  BEFORE INSERT OR UPDATE OF phone ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_phone_unique();

-- 6) updated_at trigger
DROP TRIGGER IF EXISTS merchant_employees_updated_at ON public.merchant_employees;
CREATE TRIGGER merchant_employees_updated_at
  BEFORE UPDATE ON public.merchant_employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) RLS for merchant_employees
DROP POLICY IF EXISTS "Merchants manage their employees" ON public.merchant_employees;
CREATE POLICY "Merchants manage their employees"
  ON public.merchant_employees FOR ALL
  USING (auth.uid() = merchant_id OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (
    (auth.uid() = merchant_id AND public.has_role(auth.uid(), 'merchant'::app_role))
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Employees view their record" ON public.merchant_employees;
CREATE POLICY "Employees view their record"
  ON public.merchant_employees FOR SELECT
  USING (auth.uid() = employee_id);

-- 8) Update properties RLS to support merchants + employees with permissions
DROP POLICY IF EXISTS "Authenticated users can insert items" ON public.properties;
CREATE POLICY "Merchants/admins/employees insert items"
  ON public.properties FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'properties_admin'::app_role)
    OR (auth.uid() = agent_id AND public.has_role(auth.uid(), 'merchant'::app_role))
    OR public.has_merchant_permission(auth.uid(), agent_id, 'can_add_products')
  );

DROP POLICY IF EXISTS "Owners and admins can update items" ON public.properties;
CREATE POLICY "Owners/admins/employees update items"
  ON public.properties FOR UPDATE
  USING (
    auth.uid() = agent_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'properties_admin'::app_role)
    OR public.has_merchant_permission(auth.uid(), agent_id, 'can_edit_products')
  );

DROP POLICY IF EXISTS "Owners and admins can delete items" ON public.properties;
CREATE POLICY "Owners/admins/employees delete items"
  ON public.properties FOR DELETE
  USING (
    auth.uid() = agent_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'properties_admin'::app_role)
    OR public.has_merchant_permission(auth.uid(), agent_id, 'can_delete_products')
  );
