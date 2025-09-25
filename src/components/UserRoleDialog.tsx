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
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          إدارة الصلاحيات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Shield className="w-5 h-5 text-primary" />
            إدارة صلاحيات المستخدم
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">المستخدم</p>
            <p className="font-medium">{userEmail}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {currentRoles.map(role => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {AVAILABLE_ROLES.find(r => r.value === role)?.label || role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Roles Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">اختر الصلاحيات:</h4>
            {AVAILABLE_ROLES.map(role => (
              <div key={role.value} className="flex items-start space-x-3 rtl:space-x-reverse">
                <Checkbox
                  id={role.value}
                  checked={selectedRoles.includes(role.value)}
                  onCheckedChange={(checked) => handleRoleToggle(role.value, !!checked)}
                />
                <div className="flex-1 text-right">
                  <label htmlFor={role.value} className="text-sm font-medium cursor-pointer">
                    {role.label}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : "حفظ التغييرات"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}