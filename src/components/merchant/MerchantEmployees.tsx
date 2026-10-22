import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Trash2, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { YEMEN_LOCAL_PHONE, toYemenPhone } from '@/lib/format';

const PERMISSION_LABELS: Record<string, string> = {
  can_add_products: 'إضافة منتجات',
  can_edit_products: 'تعديل منتجات',
  can_delete_products: 'حذف منتجات',
  can_manage_employees: 'إدارة الموظفين',
};

interface Employee {
  id: string;
  employee_id: string;
  permissions: Record<string, boolean>;
  profile?: { full_name: string | null; phone: string | null };
}

interface MerchantEmployeesProps {
  merchantId: string;
}

export default function MerchantEmployees({ merchantId }: MerchantEmployeesProps) {
  const { toast } = useToast();
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

  const fetchEmployees = async () => {
    setLoading(true);
    const { data: emps } = await supabase.from('merchant_employees').select('*').eq('merchant_id', merchantId);
    if (emps && emps.length > 0) {
      const ids = emps.map(e => e.employee_id);
      const { data: profs } = await supabase.rpc('get_merchant_employee_profiles', { _merchant_id: merchantId });
      const map = new Map((profs || []).map(p => [p.user_id, p]));
      setEmployees(emps.map(e => ({
        ...e,
        permissions: (e.permissions as any) || {},
        profile: map.get(e.employee_id) as any,
      })));
    } else {
      setEmployees([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, [merchantId]);

  const addEmployee = async () => {
    if (!YEMEN_LOCAL_PHONE.test(searchPhone)) return;
    setAdding(true);
    try {
      const { data: rows, error: profErr } = await supabase.rpc('merchant_find_user_by_phone', { _phone: toYemenPhone(searchPhone) });
      const profile = rows?.[0];
      if (profErr) throw profErr;
      if (!profile) {
        toast({ title: 'لا يوجد حساب بهذا الرقم', description: 'اطلب من الموظف التسجيل في التطبيق أولاً بنفس الرقم', variant: 'destructive' });
        return;
      }
      if (employees.some(e => e.employee_id === profile.user_id)) {
        toast({ title: 'هذا الموظف مضاف مسبقاً', variant: 'destructive' });
        return;
      }
      if (profile.user_id === merchantId) {
        toast({ title: 'لا يمكن إضافة نفسك', variant: 'destructive' });
        return;
      }
      const { error } = await supabase.from('merchant_employees').insert({
        merchant_id: merchantId,
        employee_id: profile.user_id,
        permissions: newPerms,
      });
      if (error) throw error;
      toast({ title: 'تمت إضافة الموظف', description: profile.full_name || undefined });
      setAddOpen(false);
      setSearchPhone('');
      fetchEmployees();
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const updatePermission = async (empId: string, key: string, val: boolean) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const newPermissions = { ...emp.permissions, [key]: val };
    const { error } = await supabase.from('merchant_employees').update({ permissions: newPermissions }).eq('id', empId);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    setEmployees(prev => prev.map(e => (e.id === empId ? { ...e, permissions: newPermissions } : e)));
  };

  const remove = async (empId: string) => {
    const { error } = await supabase.from('merchant_employees').delete().eq('id', empId);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم الحذف' });
    fetchEmployees();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-primary-text" /> الموظفون</h3>
          <p className="text-xs text-muted-foreground">أضف موظفين بأرقام هواتفهم وحدد صلاحياتهم</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-md w-[95vw]">
            <DialogHeader><DialogTitle>إضافة موظف جديد</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="emp-phone">رقم جوال الموظف</Label>
                <div className="flex gap-2 mt-1.5" dir="ltr">
                  <span className="flex items-center px-3 rounded-md border border-input bg-muted/50 text-sm font-medium select-none">+967</span>
                  <Input id="emp-phone" type="tel" inputMode="numeric" placeholder="7XXXXXXXX" value={searchPhone}
                    onChange={e => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">يجب أن يكون الموظف مسجلاً في التطبيق بنفس الرقم</p>
              </div>
              <div className="space-y-2">
                <Label>الصلاحيات</Label>
                {Object.entries(PERMISSION_LABELS).map(([k, lbl]) => (
                  <div key={k} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <Label htmlFor={`new-${k}`} className="text-sm font-normal">{lbl}</Label>
                    <Switch id={`new-${k}`} checked={(newPerms as any)[k]} onCheckedChange={v => setNewPerms(p => ({ ...p, [k]: v }))} />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>إلغاء</Button>
              <Button onClick={addEmployee} disabled={adding || !YEMEN_LOCAL_PHONE.test(searchPhone)}>
                {adding && <Loader2 className="w-4 h-4 me-2 animate-spin" />} إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">جاري التحميل...</CardContent></Card>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto opacity-30 mb-2" />
            <p className="text-sm">لا يوجد موظفون بعد</p>
          </CardContent>
        </Card>
      ) : (
        employees.map(emp => (
          <Card key={emp.id} className="bg-muted/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{emp.profile?.full_name || 'غير محدد'}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">{emp.profile?.phone || '—'}</div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`إزالة ${emp.profile?.full_name || 'الموظف'}`} className="text-destructive hover:bg-destructive/10 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl" className="max-w-[90vw] sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>إزالة {emp.profile?.full_name || 'الموظف'}؟</AlertDialogTitle>
                      <AlertDialogDescription>سيفقد الموظف صلاحية الوصول لمتجرك فوراً.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(emp.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">إزالة</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(PERMISSION_LABELS).map(([k, lbl]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded-md bg-background border text-xs">
                    <Label htmlFor={`${emp.id}-${k}`} className="text-xs font-normal">{lbl}</Label>
                    <Switch id={`${emp.id}-${k}`} checked={!!emp.permissions[k]} onCheckedChange={v => updatePermission(emp.id, k, v)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
