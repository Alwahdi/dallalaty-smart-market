import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Settings, Loader2 } from 'lucide-react';
import { UserRole } from '@/hooks/useRoles';

interface UserRoleDialogProps {
  userId: string;
  userEmail: string;
  currentRoles: UserRole[];
  onRolesUpdated: (updatedRoles: UserRole[]) => void;
}

const AVAILABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'مدير عام', description: 'صلاحيات كاملة على النظام' },
  { value: 'properties_admin', label: 'مدير العقارات', description: 'إدارة العقارات فقط' },
  { value: 'categories_admin', label: 'مدير الأقسام', description: 'إدارة الأقسام والتصنيفات' },
  { value: 'notifications_admin', label: 'مدير الإشعارات', description: 'إرسال الإشعارات للمستخدمين' },
  { value: 'moderator', label: 'مشرف', description: 'صلاحيات إشراف محدودة' },
];

export default function UserRoleDialog({ userId, userEmail, currentRoles, onRolesUpdated }: UserRoleDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(currentRoles);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleRoleToggle = (role: UserRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Delete all existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new roles
      if (selectedRoles.length > 0) {
        const rolesToInsert = selectedRoles.map(role => ({
          user_id: userId,
          role: role
        }));

        const { error } = await supabase
          .from('user_roles')
          .insert(rolesToInsert);

        if (error) throw error;
      }

      // Send notification to user about role assignment
      if (selectedRoles.length > 0) {
        const roleLabels = selectedRoles.map(role => 
          AVAILABLE_ROLES.find(r => r.value === role)?.label || role
        ).join('، ');

        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: "تم تحديث صلاحياتك",
            message: `تم تعيين صلاحيات جديدة لك: ${roleLabels}. يمكنك الآن الوصول إلى لوحة الإدارة.`,
            type: 'success'
          });
      }

      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث صلاحيات المستخدم بنجاح وإرسال إشعار له",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      onRolesUpdated(selectedRoles);
      setOpen(false);
    } catch (error: any) {
      console.error('Error updating roles:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث صلاحيات المستخدم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 px-3 touch-manipulation">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">إدارة الصلاحيات</span>
          <span className="sm:hidden">الصلاحيات</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] flex flex-col gap-0 p-0" dir="rtl">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            إدارة صلاحيات المستخدم
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="space-y-5">
            {/* User Info */}
            <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border-2 border-primary/10">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">المستخدم</p>
                  <p className="font-semibold text-sm truncate">{userEmail}</p>
                </div>
              </div>
              {currentRoles.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground mb-2">الصلاحيات الحالية:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRoles.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs font-medium">
                        {AVAILABLE_ROLES.find(r => r.value === role)?.label || role}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Roles Selection */}
            <div className="space-y-3">
              <h4 className="font-bold text-base flex items-center gap-2">
                <span>⚙️</span>
                اختر الصلاحيات الجديدة:
              </h4>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map(role => (
                  <label 
                    key={role.value}
                    htmlFor={role.value}
                    className="flex items-start gap-3 p-4 rounded-xl border-2 hover:border-primary/30 cursor-pointer transition-all touch-manipulation bg-muted/30 data-[checked=true]:border-primary/50 data-[checked=true]:bg-primary/5"
                    data-checked={selectedRoles.includes(role.value)}
                  >
                    <Checkbox
                      id={role.value}
                      checked={selectedRoles.includes(role.value)}
                      onCheckedChange={(checked) => handleRoleToggle(role.value, !!checked)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1">
                        {role.label}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-4 border-t sticky bottom-0 bg-background flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={loading}
            className="flex-1 h-12 text-base"
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="flex-1 h-12 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}