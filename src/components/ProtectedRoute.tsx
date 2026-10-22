import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import MandatoryOnboarding from '@/components/MandatoryOnboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [defaults, setDefaults] = useState({ first: '', last: '', phone: '' });

  const checkProfile = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_active, full_name, first_name, last_name, phone, latitude, longitude')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsUserActive(profile?.is_active ?? true);

      const missing =
        !profile?.first_name ||
        !profile?.last_name ||
        !profile?.phone ||
        profile?.latitude == null ||
        profile?.longitude == null;

      setNeedsOnboarding(missing);
      const meta = user.user_metadata || {};
      const fullParts = ((profile?.full_name || meta.full_name || '') as string).trim().split(/\s+/);
      setDefaults({
        first: profile?.first_name || meta.given_name || fullParts[0] || '',
        last: profile?.last_name || meta.family_name || fullParts.slice(1).join(' ') || '',
        phone: profile?.phone || '',
      });
    } catch (error) {
      console.error('Error checking profile:', error);
      setNeedsOnboarding(true);
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    if (!loading && user) {
      checkProfile();
    } else if (!loading && !user) {
      navigate('/landing');
      setProfileLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!profileLoading && user && !isUserActive) {
      supabase.auth.signOut();
      navigate('/landing');
    }
  }, [profileLoading, user, isUserActive, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary-text" />
      </div>
    );
  }

  if (!user || !isUserActive) {
    return null;
  }

  if (needsOnboarding) {
    return (
      <MandatoryOnboarding
        userId={user.id}
        defaultFirstName={defaults.first}
        defaultLastName={defaults.last}
        defaultPhone={defaults.phone}
        onComplete={() => setNeedsOnboarding(false)}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
