import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, FolderOpen, Bell, Building2, Shield, Home, Store } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AdminNotifications from '@/components/admin/AdminNotifications';
import UserManagement from '@/components/admin/UserManagement';
import SectionManagement from '@/components/admin/SectionManagement';
import PropertyManagement from '@/components/admin/PropertyManagement';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin } = useRoles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, properties: 0, categories: 0, notifications: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [u, p, c, n] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ users: u.count || 0, properties: p.count || 0, categories: c.count || 0, notifications: n.count || 0 });
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'لوحة المعلومات', icon: BarChart3, show: true },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, show: isAdmin },
    { id: 'properties', label: 'إدارة العناصر', icon: Building2, show: isAdmin || isPropertiesAdmin },
    { id: 'sections', label: 'إدارة الأقسام', icon: FolderOpen, show: isAdmin || isCategoriesAdmin },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, show: isAdmin || isNotificationsAdmin },
  ];
  const visibleTabs = tabs.filter(t => t.show);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/10">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            مرحباً بك في لوحة الإدارة
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">إدارة شاملة ومتقدمة</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'المستخدمين', value: stats.users, icon: Users, color: 'primary' },
          { label: 'العناصر', value: stats.properties, icon: Building2, color: 'blue-500' },
          { label: 'الأقسام', value: stats.categories, icon: FolderOpen, color: 'green-500' },
          { label: 'الإشعارات', value: stats.notifications, icon: Bell, color: 'orange-500' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border border-border/50 bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <div>
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">{s.label}</CardTitle>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums mt-1">
                    {s.value.toLocaleString('ar')}
                  </div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="border border-primary/10 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-5 h-5 text-primary" />
            معلومات حسابك الإداري
          </CardTitle>
          <CardDescription className="text-xs">الصلاحيات والمعلومات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</div>
            <div className="p-3 bg-background/60 rounded-xl border border-border/50 text-sm font-medium truncate">
              {user?.email}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">الصلاحيات</div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && <Badge className="bg-primary text-primary-foreground">مدير عام</Badge>}
              {isPropertiesAdmin && !isAdmin && <Badge variant="secondary">مدير العناصر</Badge>}
              {isCategoriesAdmin && !isAdmin && <Badge variant="secondary">مدير الأقسام</Badge>}
              {isNotificationsAdmin && !isAdmin && <Badge variant="secondary">مدير الإشعارات</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return isAdmin ? <UserManagement /> : null;
      case 'properties': return (isAdmin || isPropertiesAdmin) ? <PropertyManagement /> : null;
      case 'sections': return (isAdmin || isCategoriesAdmin) ? <SectionManagement /> : null;
      case 'notifications': return (isAdmin || isNotificationsAdmin) ? <AdminNotifications /> : null;
      default: return renderDashboard();
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <Sidebar side="right" collapsible="icon">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 p-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <h1 className="text-sm font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate">
                  لوحة الإدارة
                </h1>
                <p className="text-[10px] text-muted-foreground truncate">النظام الإداري</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>القوائم</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleTabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          isActive={activeTab === tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          tooltip={tab.label}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/')} tooltip="العودة للرئيسية">
                  <Home className="w-4 h-4" />
                  <span>العودة للرئيسية</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-sm truncate">
                {visibleTabs.find(t => t.id === activeTab)?.label || 'لوحة الإدارة'}
              </span>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full pb-8">
            <div className="animate-fade-in">{renderTabContent()}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
