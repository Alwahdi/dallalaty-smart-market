import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Captures the user's geolocation once after first sign-in and stores
 * the city/coordinates into their profile. Skips silently if the user
 * already has a location set or denies permission.
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
        // Skip if user already has a location
        const { data: profile } = await supabase
          .from('profiles')
          .select('location')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.location && profile.location.trim().length > 0) {
          localStorage.setItem(STORAGE_KEY, 'done');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Reverse geocode using free OpenStreetMap Nominatim
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar`,
                { headers: { 'User-Agent': 'lovable-app' } },
              );
              const json = await res.json();
              const addr = json?.address ?? {};
              const city =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.county ||
                addr.state ||
                '';
              const country = addr.country || '';
              const label = [city, country].filter(Boolean).join('، ') ||
                `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

              await supabase
                .from('profiles')
                .update({ location: label })
                .eq('user_id', user.id);

              localStorage.setItem(STORAGE_KEY, 'done');
            } catch (err) {
              console.warn('Reverse geocode failed:', err);
              // Save at least the coordinates as fallback
              await supabase
                .from('profiles')
                .update({
                  location: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
                })
                .eq('user_id', user.id);
              localStorage.setItem(STORAGE_KEY, 'done');
            }
          },
          (err) => {
            // User denied or error — don't prompt again this session
            console.info('Geolocation declined:', err.message);
            localStorage.setItem(STORAGE_KEY, 'done');
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
        );
      } catch (err) {
        console.warn('useAutoLocation error:', err);
      }
    })();
  }, [user]);
}
