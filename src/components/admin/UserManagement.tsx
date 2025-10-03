import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, UserCheck, UserX, Loader2, MoreVertical, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserRoleDialog from '@/components/UserRoleDialog';
import { UserRole } from '@/hooks/useRoles';
import { useNotificationSender } from '@/hooks/useNotificationSender';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  user_roles: { role: UserRole }[];
}

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendToUsers } = useNotificationSender();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, phone, is_active, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch emails from auth.users using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
      }

      // Create a map of user_id to email
      const emailMap: Map<string, string> = new Map();
      const authUsers = authData?.users || [];
      authUsers.forEach(u => {
        if (u.email) {
          emailMap.set(u.id, u.email);
        }
      });

      // Combine the data
      const usersWithRoles: UserProfile[] = (profilesData || []).map(profile => ({
        ...profile,
        email: emailMap.get(profile.user_id) || null,
        user_roles: (rolesData || [])
          .filter(role => role.user_id === profile.user_id)
          .map(role => ({ role: role.role as UserRole }))
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات المستخدمين",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: !isActive,
          suspended_at: !isActive ? null : new Date().toISOString(),
          suspended_by: !isActive ? null : user?.id
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "✅ تم التحديث",
        description: isActive ? "تم تعليق المستخدم بنجاح" : "تم تفعيل المستخدم بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث حالة المستخدم",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'admin': 'مدير عام',
      'properties_admin': 'مدير العقارات',
      'categories_admin': 'مدير الأقسام',
      'notifications_admin': 'مدير الإشعارات',
      'moderator': 'مشرف',
      'user': 'مستخدم'
    };
    return roleLabels[role] || role;
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-background to-muted/30">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-background to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                إدارة المستخدمين
              </span>
              <CardDescription className="mt-1">إدارة المستخدمين وتعيين الأدوار وحالة التفعيل</CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="البحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-background/50 border-border/50"
            />
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد مستخدمين</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="bg-background/50 border-border/50 hover:bg-background/80 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.full_name || 'غير محدد'}</p>
                          <p className="text-xs text-muted-foreground">{user.email || 'لا يوجد بريد'}</p>
                          <p className="text-xs text-muted-foreground">{user.phone || 'لا يوجد هاتف'}</p>
                          {user.user_roles && user.user_roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.user_roles.map((roleObj, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {getRoleLabel(roleObj.role)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge 
                          variant={user.is_active ? "default" : "destructive"} 
                          className={`text-xs ${user.is_active ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}`}
                        >
                          {user.is_active ? "نشط" : "معلق"}
                        </Badge>
                        
                        <UserRoleDialog
                          userId={user.user_id}
                          userEmail={user.email || 'لا يوجد بريد'}
                          currentRoles={user.user_roles?.map(r => r.role as UserRole) || []}
                          onRolesUpdated={async (updatedRoles) => {
                            await fetchUsers();
                            
                            // Send notification to user about role assignment
                            const roleLabels = updatedRoles.map(getRoleLabel).join(', ');
                            await sendToUsers(
                              [user.user_id],
                              'تم تعيين دور جديد',
                              `تم تعيينك في الأدوار التالية: ${roleLabels}. يمكنك الآن الوصول إلى لوحة الإدارة وإدارة المحتوى المخصص لك.`,
                              'success'
                            );
                          }}
                        />
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                              className="gap-2"
                            >
                              {user.is_active ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  تعليق المستخدم
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  تفعيل المستخدم
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}