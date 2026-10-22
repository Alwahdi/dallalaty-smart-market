import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '@/hooks/useRoles';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'properties_admin' | 'categories_admin' | 'notifications_admin';
}

const AdminGuard = ({ children, requiredRole }: AdminGuardProps) => {
  const { loading, isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin, isAnyAdmin } = useRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Check if user has required role
    let hasAccess = false;
    
    if (!requiredRole) {
      hasAccess = isAnyAdmin;
    } else {
      switch (requiredRole) {
        case 'admin':
          hasAccess = isAdmin;
          break;
        case 'properties_admin':
          hasAccess = isPropertiesAdmin || isAdmin;
          break;
        case 'categories_admin':
          hasAccess = isCategoriesAdmin || isAdmin;
          break;
        case 'notifications_admin':
          hasAccess = isNotificationsAdmin || isAdmin;
          break;
        default:
          hasAccess = false;
      }
    }

    if (!hasAccess) {
      navigate('/', { replace: true });
    }
  }, [loading, isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin, isAnyAdmin, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary-text" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;