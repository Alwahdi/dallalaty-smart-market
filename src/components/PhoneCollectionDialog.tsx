import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Loader2 } from 'lucide-react';

interface PhoneCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

// Yemeni mobile: 9 digits starting with 7 (e.g., 7XXXXXXXX). Stored as +9677XXXXXXXX
const YEMEN_LOCAL_REGEX = /^7\d{8}$/;

export default function PhoneCollectionDialog({
  isOpen,
  onClose,
  userId,
}: PhoneCollectionDialogProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep digits only, max 9
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!YEMEN_LOCAL_REGEX.test(phone)) {
      toast({
        title: 'رقم غير صحيح',
        description: 'يجب إدخال رقم يمني يبدأ بـ 7 ويتكون من 9 أرقام (مثال: 7XXXXXXXX)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const fullPhone = `+967${phone}`;

    try {
      // Check uniqueness
      const { data: existing, error: checkErr } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('phone', fullPhone)
        .neq('user_id', userId)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        toast({
          title: 'الرقم مستخدم',
          description: 'هذا الرقم مسجل لمستخدم آخر. الرجاء استخدام رقم آخر.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ phone: fullPhone })
        .eq('user_id', userId);

      if (error) {
        if ((error as any).message?.includes('PHONE_ALREADY_USED') || (error as any).code === '23505') {
          toast({
            title: 'الرقم مستخدم',
            description: 'هذا الرقم مسجل لمستخدم آخر.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      toast({
        title: 'تم الحفظ!',
        description: 'تم حفظ رقم الهاتف بنجاح',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
      onClose();
    } catch (error: any) {
      console.error('Error saving phone:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في حفظ رقم الهاتف',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { /* mandatory: cannot dismiss */ }}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary-text" />
            أكمل ملفك الشخصي
          </DialogTitle>
          <DialogDescription>
            إضافة رقم الهاتف يساعد المشترين على التواصل معك بسهولة. الخدمة متاحة حالياً في اليمن فقط 🇾🇪
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-input">رقم الهاتف اليمني</Label>
            <div className="flex items-stretch gap-2" dir="ltr">
              <div className="flex items-center gap-1.5 px-3 rounded-md border border-input bg-muted/50 text-sm font-medium shrink-0">
                <span>🇾🇪</span>
                <span>+967</span>
              </div>
              <Input
                id="phone-input"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handleChange}
                placeholder="7XXXXXXXX"
                maxLength={9}
                className="text-center tracking-wider"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              أدخل 9 أرقام تبدأ بـ 7 (بدون 00 أو +967)
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              disabled={loading || !YEMEN_LOCAL_REGEX.test(phone)}
            >
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ والمتابعة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
