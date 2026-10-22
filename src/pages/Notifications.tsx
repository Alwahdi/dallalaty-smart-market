import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import NotificationCenter from '@/components/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const { notifications, loading, markAllAsRead, deleteNotification } = useNotifications();
  const [isDark, setIsDark] = useState(false);

  // Redirect unauthenticated users
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      
      {/* Mobile Header */}
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/">
                <Button variant="outline" size="sm" className="ml-4">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-arabic flex items-center gap-3">
                  <Bell className="w-8 h-8 text-primary-text" />
                  الإشعارات
                </h1>
                <p className="text-muted-foreground font-arabic">
                  إدارة جميع إشعاراتك ({notifications.length} إشعار)
                </p>
              </div>
            </div>
            
            {notifications.length > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="font-arabic"
              >
                تحديد الكل كمقروء
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-arabic mb-4">
                  لا توجد إشعارات
                </h2>
                <p className="text-muted-foreground font-arabic mb-6 max-w-md mx-auto">
                  ستظهر هنا جميع الإشعارات المهمة والتحديثات الخاصة بحسابك
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="w-full">
                    <NotificationCenter />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}