import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Store, Package, Users, Plus, Loader2, Trash2, ArrowRight, Shield } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  permissions: {
    can_add_products?: boolean;
    can_edit_products?: boolean;
    can_delete_products?: boolean;
    can_manage_employees?: boolean;
  };
  profile?: { full_name: string | null; phone: string | null; email: string | null };
}

const PERMISSION_LABELS: Record<string, string> = {
  can_add_products: 'إضافة منتجات',
  can_edit_products: 'تعديل منتجات',
  can_delete_products: 'حذف منتجات',
  can_manage_employees: 'إدارة الموظفين',
};

export default function MerchantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMerchant, isAdmin, loading: rolesLoading } = useRoles();
  const { toast } = useToast();
  const [productsCount, setProductsCount] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [adding, setAdding] = useState(false);
  const [newPerms, setNewPerms] = useState({
    can_add_products: true,
    can_edit_products: true,
    can_delete_products: false,
    can_manage_employees: false,
  });

  useEffect(() => {
    if (rolesLoading) return;
    if (!isMerchant && !isAdmin) {
      navigate('/', { replace: true });
      return;
    }
    fetchAll();
  }, [rolesLoading, isMerchant, isAdmin]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ count }, { data: emps }] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('agent_id', user.id),
        supabase.from('merchant_employees').select('*').eq('merchant_id', user.id),
      ]);
      setProductsCount(count || 0);

      if (emps && emps.length > 0) {
        const ids = emps.map(e => e.employee_id);
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name, phone, email')
          .in('user_id', ids);
        const profMap = new Map((profs || []).map(p => [p.user_id, p]));
        setEmployees(
          emps.map(e => ({
            ...e,
            permissions: (e.permissions as any) || {},
            profile: profMap.get(e.employee_id) as any,
          })) as Employee[]
        );
      } else {
        setEmployees([]);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async () => {
    if (!user || !searchPhone.trim()) return;
    setAdding(true);
    try {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .eq('phone', searchPhone.trim())
        .maybeSingle();

      if (profErr || !profile) {
        toast({ title: 'لم يتم العثور على المستخدم', description: 'تأكد من صحة رقم الهاتف', variant: 'destructive' });
        return;
      }
      if (profile.user_id === user.id) {
        toast({ title: 'لا يمكن إضافة نفسك', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('merchant_employees').insert({
        merchant_id: user.id,
        employee_id: profile.user_id,
        permissions: newPerms,
      });
      if (error) throw error;

      toast({ title: '✅ تمت الإضافة', description: `تمت إضافة ${profile.full_name || profile.phone} كموظف` });
      setAddOpen(false);
      setSearchPhone('');
      fetchAll();
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message || 'فشل في الإضافة', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const updatePermission = async (empId: string, key: string, val: boolean) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const newPermissions = { ...emp.permissions, [key]: val };
    const { error } = await supabase
      .from('merchant_employees')
      .update({ permissions: newPermissions })
      .eq('id', empId);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    setEmployees(prev => prev.map(e => (e.id === empId ? { ...e, permissions: newPermissions } : e)));
  };

  const removeEmployee = async (empId: string) => {
    const { error } = await supabase.from('merchant_employees').delete().eq('id', empId);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم الحذف' });
    fetchAll();
  };

  if (rolesLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Store className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-base sm:text-lg flex-1 truncate">لوحة التاجر</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-xs text-muted-foreground uppercase">منتجاتي</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold mt-1">{productsCount.toLocaleString('ar-YE')}</div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-xs text-muted-foreground uppercase">موظفيني</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold mt-1">{employees.length.toLocaleString('ar-YE')}</div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                الموظفون
              </CardTitle>
              <CardDescription className="text-xs">أضف موظفين وحدد صلاحياتهم</CardDescription>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1 shrink-0">
                  <Plus className="w-4 h-4" />
                  إضافة
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl" className="max-w-md w-[95vw]">
                <DialogHeader>
                  <DialogTitle>إضافة موظف جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label>رقم هاتف الموظف (يمني)</Label>
                    <Input
                      placeholder="7xxxxxxxx"
                      value={searchPhone}
                      onChange={e => setSearchPhone(e.target.value)}
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground mt-1">يجب أن يكون مسجل في التطبيق برقم الهاتف نفسه</p>
                  </div>
                  <div className="space-y-2">
                    <Label>الصلاحيات</Label>
                    {Object.entries(PERMISSION_LABELS).map(([k, lbl]) => (
                      <div key={k} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <span className="text-sm">{lbl}</span>
                        <Switch
                          checked={(newPerms as any)[k]}
                          onCheckedChange={v => setNewPerms(p => ({ ...p, [k]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>
                    إلغاء
                  </Button>
                  <Button onClick={addEmployee} disabled={adding || !searchPhone.trim()}>
                    {adding && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                    إضافة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {employees.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
                لا يوجد موظفين بعد
              </div>
            ) : (
              employees.map(emp => (
                <Card key={emp.id} className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{emp.profile?.full_name || 'غير محدد'}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{emp.profile?.phone || '—'}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmployee(emp.id)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(PERMISSION_LABELS).map(([k, lbl]) => (
                        <div key={k} className="flex items-center justify-between p-2 rounded-md bg-background border text-xs">
                          <span>{lbl}</span>
                          <Switch
                            checked={!!(emp.permissions as any)[k]}
                            onCheckedChange={v => updatePermission(emp.id, k, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3 items-start">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">كيف يعمل النظام؟</p>
              يمكنك إضافة موظفين برقم هاتفهم المسجل في التطبيق، وتحديد صلاحيات كل واحد بشكل مستقل. الموظف سيقدر يدير منتجاتك حسب الصلاحيات الممنوحة له فقط.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
