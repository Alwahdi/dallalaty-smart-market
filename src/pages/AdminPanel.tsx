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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center lg:text-right">
        <div className="inline-flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              مرحباً بك في لوحة الإدارة
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">إدارة شاملة ومتقدمة لجميع جوانب النظام</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border-0 bg-gradient-to-br from-background to-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <div className="space-y-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">المستخدمين</CardTitle>
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-primary">{stats.users.toLocaleString('ar')}</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 p-3 sm:p-6">
            <p className="text-[10px] sm:text-xs text-muted-foreground">مستخدم مسجل</p>
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
        
        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 border-0 bg-gradient-to-br from-background to-green-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <div className="space-y-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">الأقسام</CardTitle>
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-green-600">{stats.categories.toLocaleString('ar')}</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300 flex-shrink-0">
              <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 p-3 sm:p-6">
            <p className="text-[10px] sm:text-xs text-muted-foreground">قسم نشط</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 border-0 bg-gradient-to-br from-background to-orange-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <div className="space-y-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">الإشعارات</CardTitle>
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-orange-600">{stats.notifications.toLocaleString('ar')}</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors duration-300 flex-shrink-0">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 p-3 sm:p-6">
            <p className="text-[10px] sm:text-xs text-muted-foreground">إشعار مُرسل</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                معلومات حسابك الإداري
              </span>
              <CardDescription className="mt-1">الصلاحيات والمعلومات الشخصية</CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="font-medium text-sm text-muted-foreground">البريد الإلكتروني</span>
              <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="font-medium text-sm text-muted-foreground">الصلاحيات</span>
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    مدير عام
                  </Badge>
                )}
                {isPropertiesAdmin && !isAdmin && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    مدير العقارات
                  </Badge>
                )}
                {isCategoriesAdmin && !isAdmin && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    مدير الأقسام
                  </Badge>
                )}
                {isNotificationsAdmin && !isAdmin && (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                    مدير الإشعارات
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">الإجراءات السريعة</CardTitle>
          <CardDescription className="text-xs sm:text-sm">أهم العمليات الإدارية للوصول المباشر</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {isAdmin && (
              <Button 
                variant="outline" 
                className="justify-start gap-3 sm:gap-4 h-auto py-3 sm:py-4 px-4 sm:px-6 bg-background/50 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 group touch-manipulation"
                onClick={() => setActiveTab('users')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm">إدارة المستخدمين</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">تفعيل وتعليق الحسابات وإدارة الأدوار</div>
                </div>
              </Button>
            )}
            {(isAdmin || isPropertiesAdmin) && (
              <Button 
                variant="outline" 
                className="justify-start gap-3 sm:gap-4 h-auto py-3 sm:py-4 px-4 sm:px-6 bg-background/50 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all duration-200 group touch-manipulation"
                onClick={() => setActiveTab('properties')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-200 flex-shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:w-5 text-blue-500" />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm">إدارة العقارات</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">إضافة وتحرير ومراجعة العقارات</div>
                </div>
              </Button>
            )}
            {(isAdmin || isCategoriesAdmin) && (
              <Button 
                variant="outline" 
                className="justify-start gap-3 sm:gap-4 h-auto py-3 sm:py-4 px-4 sm:px-6 bg-background/50 hover:bg-green-500/5 hover:border-green-500/20 transition-all duration-200 group touch-manipulation"
                onClick={() => setActiveTab('sections')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-200 flex-shrink-0">
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm">إدارة الأقسام</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">تنظيم الأقسام وتعيين المشرفين</div>
                </div>
              </Button>
            )}
            {(isAdmin || isNotificationsAdmin) && (
              <Button 
                variant="outline" 
                className="justify-start gap-3 sm:gap-4 h-auto py-3 sm:py-4 px-4 sm:px-6 bg-background/50 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all duration-200 group touch-manipulation"
                onClick={() => setActiveTab('notifications')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors duration-200 flex-shrink-0">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm">إرسال الإشعارات</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">إشعار المستخدمين بالتحديثات المهمة</div>
                </div>
              </Button>
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
      {/* Mobile Header with Tab Navigation */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-primary/10"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              لوحة الإدارة
            </h1>
          </div>
          <div className="w-9" /> {/* Spacer for balance */}
        </div>
        
        {/* Mobile Tab Navigation */}
        <div className="flex overflow-x-auto scrollbar-hide pb-2 px-2 gap-1.5">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                className={`
                  whitespace-nowrap gap-1.5 min-w-fit transition-all duration-200 touch-manipulation
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'bg-background/80 hover:bg-primary/10 border-border/50'
                  }
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Button>
            );
          })}
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

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          <main className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto pb-20 lg:pb-8">
            <div className="animate-fade-in">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}