import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useLocalStorage';
import { useRouteTracking } from '@/hooks/useRouteTracking';

const CacheManager = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { preferences } = useUserPreferences();
  const { shouldRestoreSession, getLastSession } = useRouteTracking();
  const promptedRef = useRef(false);

  // Offer to restore last session via toast (non-blocking)
  useEffect(() => {
    if (promptedRef.current) return;
    if (!user || !shouldRestoreSession()) return;

    const lastSession = getLastSession();
    if (
      !lastSession ||
      lastSession.path === location.pathname ||
      lastSession.path.includes('/auth') ||
      lastSession.path.includes('/landing')
    ) {
      return;
    }

    promptedRef.current = true;
    toast('هل تريد العودة إلى آخر صفحة كنت تتصفحها؟', {
      action: {
        label: 'العودة',
        onClick: () => navigate(lastSession.path + lastSession.search),
      },
      duration: 8000,
    });
  }, [user, location.pathname, navigate, shouldRestoreSession, getLastSession]);

  useEffect(() => {
    if (preferences.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }, [preferences.language]);

  return null;
};

export default CacheManager;
