import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth', { replace: true });
          return;
        }

        if (data?.session) {
          // User is authenticated, redirect to home
          navigate('/', { replace: true });
        } else {
          // No session, redirect to auth
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-text mx-auto mb-4" />
        <p className="text-muted-foreground">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}