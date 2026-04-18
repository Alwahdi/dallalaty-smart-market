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
  const [defaultName, setDefaultName] = useState('');

  const checkProfile = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_active, full_name, phone, latitude, longitude')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsUserActive(profile?.is_active ?? true);

      const missing =
        !profile?.full_name ||
        !profile?.phone ||
        profile?.phone === '' ||
        profile?.latitude == null ||
        profile?.longitude == null;

      setNeedsOnboarding(missing);
      setDefaultName(profile?.full_name || (user.user_metadata?.full_name as string) || '');
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        defaultFullName={defaultName}
        onComplete={() => setNeedsOnboarding(false)}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
