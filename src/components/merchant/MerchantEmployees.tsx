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
      const { data: profs } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', ids);
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
    if (!searchPhone.trim()) return;
    setAdding(true);
    try {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .eq('phone', searchPhone.trim())
        .maybeSingle();

      if (profErr || !profile) {
        toast({ title: 'لم يتم العثور على المستخدم', description: 'تأكد من رقم الهاتف', variant: 'destructive' });
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
      toast({ title: '✅ تمت الإضافة' });
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
                <Label>رقم الهاتف</Label>
                <Input placeholder="7xxxxxxxx" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} dir="ltr" />
                <p className="text-xs text-muted-foreground mt-1">يجب أن يكون مسجلاً بنفس الرقم</p>
              </div>
              <div className="space-y-2">
                <Label>الصلاحيات</Label>
                {Object.entries(PERMISSION_LABELS).map(([k, lbl]) => (
                  <div key={k} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <span className="text-sm">{lbl}</span>
                    <Switch checked={(newPerms as any)[k]} onCheckedChange={v => setNewPerms(p => ({ ...p, [k]: v }))} />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>إلغاء</Button>
              <Button onClick={addEmployee} disabled={adding || !searchPhone.trim()}>
                {adding && <Loader2 className="w-4 h-4 ml-2 animate-spin" />} إضافة
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
                <Button variant="ghost" size="icon" onClick={() => remove(emp.id)} className="text-destructive hover:bg-destructive/10 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(PERMISSION_LABELS).map(([k, lbl]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded-md bg-background border text-xs">
                    <span>{lbl}</span>
                    <Switch checked={!!emp.permissions[k]} onCheckedChange={v => updatePermission(emp.id, k, v)} />
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
