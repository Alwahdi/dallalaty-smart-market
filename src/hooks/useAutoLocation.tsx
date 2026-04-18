import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Captures the user's geolocation once after first sign-in and stores
 * latitude, longitude, and city into their profile (Yemen-only, GPS only).
 * Skips if the user already has coordinates set or denies permission.
 */
export function useAutoLocation() {
  const { user } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (!user || handled.current) return;
    if (!('geolocation' in navigator)) return;

    handled.current = true;
    const STORAGE_KEY = `geo_prompted_${user.id}`;
    if (localStorage.getItem(STORAGE_KEY) === 'done') return;

    (async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('latitude, longitude, city')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.latitude && profile?.longitude) {
          localStorage.setItem(STORAGE_KEY, 'done');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar&countrycodes=ye`,
              );
              const json = await res.json();
              const addr = json?.address ?? {};
              const city = addr.city || addr.town || addr.village || addr.county || addr.state || '';

              await supabase
                .from('profiles')
                .update({ latitude, longitude, city })
                .eq('user_id', user.id);

              localStorage.setItem(STORAGE_KEY, 'done');
            } catch (err) {
              console.warn('Reverse geocode failed:', err);
              await supabase
                .from('profiles')
                .update({ latitude, longitude })
                .eq('user_id', user.id);
              localStorage.setItem(STORAGE_KEY, 'done');
            }
          },
          (err) => {
            console.info('Geolocation declined:', err.message);
            localStorage.setItem(STORAGE_KEY, 'done');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 },
        );
      } catch (err) {
        console.warn('useAutoLocation error:', err);
      }
    })();
  }, [user]);
}
