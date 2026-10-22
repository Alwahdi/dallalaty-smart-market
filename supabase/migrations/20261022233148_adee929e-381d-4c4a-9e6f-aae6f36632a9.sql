CREATE OR REPLACE FUNCTION public.is_phone_taken(_phone text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE phone = _phone AND user_id <> auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_phone_taken(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_phone_taken(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.merchant_find_user_by_phone(_phone text)
RETURNS TABLE(user_id uuid, full_name text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'merchant') OR public.has_role(auth.uid(), 'admin')
          OR EXISTS (SELECT 1 FROM public.merchant_employees me WHERE me.employee_id = auth.uid() AND (me.permissions->>'can_manage_employees')::boolean)) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN QUERY SELECT p.user_id, p.full_name FROM public.profiles p WHERE p.phone = _phone LIMIT 1;
END; $$;
REVOKE ALL ON FUNCTION public.merchant_find_user_by_phone(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.merchant_find_user_by_phone(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_merchant_employee_profiles(_merchant_id uuid)
RETURNS TABLE(user_id uuid, full_name text, phone text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (auth.uid() = _merchant_id OR public.has_role(auth.uid(), 'admin')
          OR public.has_merchant_permission(auth.uid(), _merchant_id, 'can_manage_employees')) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN QUERY SELECT p.user_id, p.full_name, p.phone FROM public.profiles p
    JOIN public.merchant_employees me ON me.employee_id = p.user_id WHERE me.merchant_id = _merchant_id;
END; $$;
REVOKE ALL ON FUNCTION public.get_merchant_employee_profiles(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_merchant_employee_profiles(uuid) TO authenticated;