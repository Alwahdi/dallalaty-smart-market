ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

CREATE OR REPLACE FUNCTION public.protect_phone_verification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.phone_verified := false; NEW.phone_verified_at := null;
    ELSE
      IF NEW.phone IS DISTINCT FROM OLD.phone THEN
        NEW.phone_verified := false; NEW.phone_verified_at := null;
      ELSE
        NEW.phone_verified := OLD.phone_verified; NEW.phone_verified_at := OLD.phone_verified_at;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.protect_phone_verification() FROM anon, public;

DROP TRIGGER IF EXISTS protect_phone_verification ON public.profiles;
CREATE TRIGGER protect_phone_verification BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_phone_verification();