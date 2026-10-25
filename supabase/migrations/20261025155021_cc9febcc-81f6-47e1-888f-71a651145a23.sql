INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::public.app_role
FROM public.profiles p
WHERE p.user_id = '0986ca32-e956-4456-8ae7-9d9e3e49e894'::uuid
  AND p.email = 'mohmohdheb@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = p.user_id AND r.role = 'admin'::public.app_role
  );