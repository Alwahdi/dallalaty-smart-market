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

      // Fetch emails via secure edge function (admins only).
      // The previous direct call to supabase.auth.admin.listUsers() from the
      // browser always returns 403 because it requires service_role.
      const emailMap: Map<string, string> = new Map();
      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
          'admin-list-users',
        );
        if (edgeErr) {
          console.warn('admin-list-users edge call failed:', edgeErr);
        } else if (edgeData?.users) {
          (edgeData.users as Array<{ id: string; email: string | null }>).forEach((u) => {
            if (u.email) emailMap.set(u.id, u.email);
          });
        }
      } catch (e) {
        console.warn('admin-list-users threw:', e);
      }

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

  const promoteToMerchant = async (userId: string, name: string | null) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'merchant' });
      if (error && !error.message.includes('duplicate')) throw error;
      await sendToUsers([userId], '🎉 تمت ترقيتك إلى تاجر', `مبروك! تقدر الآن تضيف منتجاتك وتدير موظفينك من /merchant`, 'success');
      toast({ title: '✅ تمت الترقية', description: `${name || 'المستخدم'} الآن تاجر` });
      fetchUsers();
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'admin': 'مدير عام',
      'properties_admin': 'مدير العناصر',
      'categories_admin': 'مدير الأقسام',
      'notifications_admin': 'مدير الإشعارات',
      'moderator': 'مشرف',
      'merchant': 'تاجر',
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
          <Loader2 className="h-8 w-8 animate-spin text-primary-text" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold">
                إدارة المستخدمين
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                إدارة المستخدمين وتعيين الأدوار وحالة التفعيل
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">إجمالي المستخدمين</div>
              <div className="text-2xl font-bold text-primary-text">{users.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-3 border border-green-500/10">
              <div className="text-xs text-muted-foreground mb-1">نشط</div>
              <div className="text-2xl font-bold text-success">
                {users.filter(u => u.is_active).length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-3 border border-red-500/10 col-span-2 sm:col-span-1">
              <div className="text-xs text-muted-foreground mb-1">معلق</div>
              <div className="text-2xl font-bold text-destructive">
                {users.filter(u => !u.is_active).length}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="البحث بالاسم، البريد، أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-11 h-12 text-base bg-background/50 border-border/50"
            />
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium">{searchTerm ? 'لم يتم العثور على نتائج' : 'لا توجد مستخدمين'}</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="bg-background/50 border-2 hover:border-primary/20 transition-all duration-200">
                  <CardContent className="p-0">
                    {/* User Info Section */}
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0 border-2 border-primary/10">
                        <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary-text" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-base sm:text-lg truncate">
                            {user.full_name || 'غير محدد'}
                          </h3>
                          <Badge 
                            variant={user.is_active ? "default" : "destructive"} 
                            className={`text-xs shrink-0 ${user.is_active ? 'bg-success/15 text-success border-success/30 hover:bg-success/20' : ''}`}
                          >
                            {user.is_active ? "🟢 نشط" : "🔴 معلق"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">📧</span>
                            <span className="truncate">{user.email || 'لا يوجد بريد'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">📱</span>
                            <span>{user.phone || 'لا يوجد هاتف'}</span>
                          </div>
                        </div>
                        {user.user_roles && user.user_roles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {user.user_roles.map((roleObj, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs font-medium">
                                {getRoleLabel(roleObj.role)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>🕐</span>
                        {new Date(user.created_at).toLocaleDateString('ar-YE-u-nu-latn', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-2">
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
                            <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation hover:bg-background">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            {!user.user_roles?.some(r => r.role === 'merchant') && (
                              <DropdownMenuItem
                                onClick={() => promoteToMerchant(user.user_id, user.full_name)}
                                className="gap-2 cursor-pointer py-3"
                              >
                                <span>🏪</span>
                                <span>ترقية إلى تاجر</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                              className="gap-2 cursor-pointer py-3"
                            >
                              {user.is_active ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  <span>تعليق المستخدم</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span>تفعيل المستخدم</span>
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