import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Users, FolderOpen, Bell, Building2, Shield, Home } from 'lucide-react';
import AdminNotifications from '@/components/admin/AdminNotifications';
import UserManagement from '@/components/admin/UserManagement';
import SectionManagement from '@/components/admin/SectionManagement';
import PropertyManagement from '@/components/admin/PropertyManagement';
import RoleDebugger from '@/components/RoleDebugger';
import DatabaseRoleChecker from '@/components/DatabaseRoleChecker';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin, isAnyAdmin } = useRoles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    categories: 0,
    notifications: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResult, propertiesResult, categoriesResult, notificationsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersResult.count || 0,
        properties: propertiesResult.count || 0,
        categories: categoriesResult.count || 0,
        notifications: notificationsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Admin access is handled by AdminGuard at the route level

  const tabs = [
    { id: 'dashboard', label: 'لوحة المعلومات', icon: BarChart3, show: true },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, show: isAdmin },
    { id: 'properties', label: 'إدارة العقارات', icon: Building2, show: isAdmin || isPropertiesAdmin },
    { id: 'sections', label: 'إدارة الأقسام', icon: FolderOpen, show: isAdmin || isCategoriesAdmin },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, show: isAdmin || isNotificationsAdmin }
  ];

  const visibleTabs = tabs.filter(tab => tab.show);

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header - Mobile Optimized */}
      <div className="text-center lg:text-right">
        <div className="inline-flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent leading-tight">
              مرحباً بك في لوحة الإدارة
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-0.5">إدارة شاملة ومتقدمة</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Enhanced Mobile Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-6">
        <Card className="relative overflow-hidden group active:scale-95 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border border-primary/10 bg-gradient-to-br from-background via-primary/5 to-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1.5 p-3 sm:p-4 lg:p-6">
            <div className="space-y-0.5 sm:space-y-1">
              <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">المستخدمين</CardTitle>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tabular-nums">{stats.users.toLocaleString('ar')}</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-primary/15 rounded-xl flex items-center justify-center group-hover:bg-primary/25 group-active:scale-90 transition-all duration-200 flex-shrink-0 shadow-sm">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 p-3 sm:p-4 lg:p-6">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-medium">مستخدم نشط</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 border-0 bg-gradient-to-br from-background to-blue-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <div className="space-y-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">العقارات</CardTitle>
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-blue-600">{stats.properties.toLocaleString('ar')}</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300 flex-shrink-0">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 p-3 sm:p-6">
            <p className="text-[10px] sm:text-xs text-muted-foreground">عقار منشور</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group active:scale-95 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 border border-green-500/10 bg-gradient-to-br from-background via-green-500/5 to-green-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1.5 p-3 sm:p-4 lg:p-6">
            <div className="space-y-0.5 sm:space-y-1">
              <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">الأقسام</CardTitle>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 tabular-nums">{stats.categories.toLocaleString('ar')}</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-green-500/15 rounded-xl flex items-center justify-center group-hover:bg-green-500/25 group-active:scale-90 transition-all duration-200 flex-shrink-0 shadow-sm">
              <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 p-3 sm:p-4 lg:p-6">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-medium">قسم نشط</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group active:scale-95 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 border border-orange-500/10 bg-gradient-to-br from-background via-orange-500/5 to-orange-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1.5 p-3 sm:p-4 lg:p-6">
            <div className="space-y-0.5 sm:space-y-1">
              <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">الإشعارات</CardTitle>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 tabular-nums">{stats.notifications.toLocaleString('ar')}</div>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-orange-500/15 rounded-xl flex items-center justify-center group-hover:bg-orange-500/25 group-active:scale-90 transition-all duration-200 flex-shrink-0 shadow-sm">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 p-3 sm:p-4 lg:p-6">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-medium">إشعار مُرسل</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Info - Mobile Enhanced */}
      <Card className="relative overflow-hidden border border-primary/10 bg-gradient-to-br from-background via-primary/5 to-transparent shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold block truncate">
                معلومات حسابك الإداري
              </span>
              <CardDescription className="text-[10px] sm:text-xs mt-0.5">الصلاحيات والمعلومات</CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="font-semibold text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">البريد الإلكتروني</span>
              <div className="p-2.5 sm:p-3 bg-background/60 rounded-xl border border-border/50 shadow-sm">
                <span className="text-xs sm:text-sm font-medium truncate block">{user?.email}</span>
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <span className="font-semibold text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">الصلاحيات</span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {isAdmin && (
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] sm:text-xs px-2 py-1 shadow-sm">
                    مدير عام
                  </Badge>
                )}
                {isPropertiesAdmin && !isAdmin && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] sm:text-xs px-2 py-1">
                    مدير العقارات
                  </Badge>
                )}
                {isCategoriesAdmin && !isAdmin && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] sm:text-xs px-2 py-1">
                    مدير الأقسام
                  </Badge>
                )}
                {isNotificationsAdmin && !isAdmin && (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] sm:text-xs px-2 py-1">
                    مدير الإشعارات
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Mobile Optimized */}
      <Card className="border border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-sm">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2">
            <div className="w-1.5 h-5 bg-gradient-to-b from-primary to-primary/80 rounded-full" />
            الإجراءات السريعة
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs lg:text-sm mt-1">أهم العمليات للوصول المباشر</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4">
            {isAdmin && (
              <button 
                className="flex items-start gap-2.5 sm:gap-3 h-auto py-2.5 sm:py-3 px-3 sm:px-4 bg-background/80 hover:bg-primary/10 active:bg-primary/15 border border-border/50 hover:border-primary/30 rounded-xl transition-all duration-200 group touch-manipulation active:scale-[0.98] text-right"
                onClick={() => setActiveTab('users')}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/15 rounded-xl flex items-center justify-center group-hover:bg-primary/25 group-active:scale-90 transition-all duration-200 flex-shrink-0 shadow-sm">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="font-bold text-xs sm:text-sm text-foreground mb-0.5">إدارة المستخدمين</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">تفعيل وتعليق الحسابات</div>
                </div>
              </button>
            )}
            {(isAdmin || isPropertiesAdmin) && (
              <button 
                className="flex items-start gap-2.5 sm:gap-3 h-auto py-2.5 sm:py-3 px-3 sm:px-4 bg-background/80 hover:bg-blue-500/10 active:bg-blue-500/15 border border-border/50 hover:border-blue-500/30 rounded-xl transition-all duration-200 group touch-manipulation active:scale-[0.98] text-right"
                onClick={() => setActiveTab('properties')}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-500/15 rounded-xl flex items-center justify-center group-hover:bg-blue-500/25 group-active:scale-90 transition-all duration-200 flex-shrink-0 shadow-sm">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="font-bold text-xs sm:text-sm text-foreground mb-0.5">إدارة العقارات</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">إضافة وتحرير العقارات</div>
                </div>
              </button>
            )}
            {(isAdmin || isCategoriesAdmin) && (
              <button 
                className="flex items-start gap-2.5 sm:gap-3 h-auto py-2.5 sm:py-3 px-3 sm:px-4 bg-background/80 hover:bg-green-500/10 active:bg-green-500/15 border border-border/50 hover:border-green-500/30 rounded-xl transition-all duration-200 group touch-manipulation active:scale-[0.98] text-right"
                onClick={() => setActiveTab('sections')}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-green-500/15 rounded-xl flex items-center justify-center group-hover:bg-green-500/25 group-active:scale-90 transition-all duration-200 flex-shrink-0 shadow-sm">
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="font-bold text-xs sm:text-sm text-foreground mb-0.5">إدارة الأقسام</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">تنظيم وتعيين المشرفين</div>
                </div>
              </button>
            )}
            {(isAdmin || isNotificationsAdmin) && (
              <button 
                className="flex items-start gap-2.5 sm:gap-3 h-auto py-2.5 sm:py-3 px-3 sm:px-4 bg-background/80 hover:bg-orange-500/10 active:bg-orange-500/15 border border-border/50 hover:border-orange-500/30 rounded-xl transition-all duration-200 group touch-manipulation active:scale-[0.98] text-right"
                onClick={() => setActiveTab('notifications')}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-orange-500/15 rounded-xl flex items-center justify-center group-hover:bg-orange-500/25 group-active:scale-90 transition-all duration-200 flex-shrink-0 shadow-sm">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="font-bold text-xs sm:text-sm text-foreground mb-0.5">إرسال الإشعارات</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">إشعار المستخدمين</div>
                </div>
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return isAdmin ? <UserManagement /> : null;
      case 'properties':
        return (isAdmin || isPropertiesAdmin) ? <PropertyManagement /> : null;
      case 'sections':
        return (isAdmin || isCategoriesAdmin) ? <SectionManagement /> : null;
      case 'notifications':
        return (isAdmin || isNotificationsAdmin) ? <AdminNotifications /> : null;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      {/* Mobile Header with Tab Navigation - Ultra Optimized */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-primary/10 active:bg-primary/20 active:scale-95 transition-all duration-200 touch-manipulation"
          >
            <Home className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-lg flex items-center justify-center shadow-md shadow-primary/30">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              لوحة الإدارة
            </h1>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Mobile Tab Navigation with Scroll Indicator */}
        <div className="relative">
          <div className="flex overflow-x-auto scrollbar-hide pb-2.5 px-3 gap-2 snap-x snap-mandatory">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-xl whitespace-nowrap transition-all duration-300 touch-manipulation snap-start ${
                    isActive
                      ? 'bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-lg shadow-primary/40 scale-105' 
                      : 'bg-muted/60 text-muted-foreground hover:bg-primary/10 active:scale-95 border border-border/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`} />
                  <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-primary-foreground' : ''}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Scroll Indicators */}
          <div className="absolute left-0 top-0 bottom-2.5 w-8 bg-gradient-to-r from-background/98 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-2.5 w-8 bg-gradient-to-l from-background/98 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-72 lg:flex-col">
          <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border/50">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    لوحة الإدارة
                  </h1>
                  <p className="text-sm text-muted-foreground">النظام الإداري المتقدم</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`
                      w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                        : 'hover:bg-primary/10 hover:translate-x-1'
                      }
                    `}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                    <span className="font-medium">{tab.label}</span>
                  </Button>
                );
              })}
            </nav>
            
            {/* Footer */}
            <div className="p-4 border-t border-border/50">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-primary/5 border-border/50"
                onClick={() => navigate('/')}
              >
                <Home className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">العودة للرئيسية</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile Optimized */}
        <div className="flex-1 min-h-screen">
          <main className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
            <div className="animate-fade-in">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}