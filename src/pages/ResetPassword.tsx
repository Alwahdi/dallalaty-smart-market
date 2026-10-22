import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound } from 'lucide-react';
import PasswordStrength from '@/components/PasswordStrength';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && window.location.hash.includes('type=recovery'))) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const valid = password.length >= 8 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم تغيير كلمة المرور', description: 'يمكنك الآن الدخول بكلمة المرور الجديدة' });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background font-arabic" dir="rtl">
      <form onSubmit={submit} className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 space-y-5">
        <div className="text-center">
          <KeyRound className="w-10 h-10 mx-auto text-primary-text mb-2" />
          <h1 className="text-2xl font-bold">تعيين كلمة مرور جديدة</h1>
        </div>
        {!ready ? (
          <p className="text-sm text-muted-foreground text-center">
            افتح هذه الصفحة من الرابط المرسل إلى بريدك. إذا انتهت صلاحية الرابط، اطلب رابطاً جديداً من صفحة الدخول.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="np">كلمة المرور الجديدة</Label>
              <Input id="np" type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" autoComplete="new-password" />
              <PasswordStrength password={password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp">تأكيد كلمة المرور</Label>
              <Input id="cp" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} dir="ltr" autoComplete="new-password" />
              {confirm && password !== confirm && <p className="text-xs text-destructive">غير متطابقة</p>}
            </div>
            <Button type="submit" className="w-full h-12" disabled={!valid || saving}>
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}حفظ
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
