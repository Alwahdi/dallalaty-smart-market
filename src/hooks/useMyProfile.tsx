import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MyProfile { full_name: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null; city: string | null }

/** Lightweight current-user profile for headers. Refreshes on the `profile-updated` window event. */
export function useMyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    const load = () => supabase.from('profiles')
      .select('full_name,first_name,last_name,avatar_url,city')
      .eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setProfile(data as MyProfile | null));
    load();
    window.addEventListener('profile-updated', load);
    return () => window.removeEventListener('profile-updated', load);
  }, [user]);

  const initials = profile
    ? `${profile.first_name?.[0] || profile.full_name?.[0] || ''}${profile.last_name?.[0] || ''}`
    : '';
  return { profile, initials: initials || user?.email?.[0]?.toUpperCase() || '?' };
}
