import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Loader2, MapPin, User, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';
import { YEMEN_LOCAL_PHONE, toYemenPhone, fromYemenPhone } from '@/lib/format';
import { captureGpsLocation } from '@/lib/location';

interface Props {
  userId: string;
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultPhone?: string;
  onComplete: () => void;
}

type LocState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; latitude: number; longitude: number; city: string }
  | { status: 'error'; message: string };

type PhoneCheck = 'idle' | 'checking' | 'available' | 'taken';

export default function MandatoryOnboarding({
  userId, defaultFirstName = '', defaultLastName = '', defaultPhone = '', onComplete,
}: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [phone, setPhone] = useState(fromYemenPhone(defaultPhone));
  const [phoneCheck, setPhoneCheck] = useState<PhoneCheck>('idle');
  const [loc, setLoc] = useState<LocState>({ status: 'idle' });
  const [saving, setSaving] = useState(false);

  const nameValid = firstName.trim().length >= 2 && lastName.trim().length >= 2;
  const phoneFormatValid = YEMEN_LOCAL_PHONE.test(phone);

  // Live uniqueness check (debounced)
  useEffect(() => {
    if (!phoneFormatValid) { setPhoneCheck('idle'); return; }
    setPhoneCheck('checking');
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles').select('user_id')
        .eq('phone', toYemenPhone(phone)).neq('user_id', userId).maybeSingle();
      setPhoneCheck(data ? 'taken' : 'available');
    }, 400);
    return () => clearTimeout(t);
  }, [phone, phoneFormatValid, userId]);

  useEffect(() => {
    if (step === 3 && loc.status === 'idle') captureLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const captureLocation = async () => {
    setLoc({ status: 'loading' });
    try {
      const r = await captureGpsLocation();
      setLoc({ status: 'ready', ...r });
    } catch (e: any) {
      setLoc({ status: 'error', message: e.message });
    }
  };

  const handleSubmit = async () => {
    if (!nameValid || !phoneFormatValid || phoneCheck === 'taken' || loc.status !== 'ready') return;
    setSaving(true);
    try {
      const fn = firstName.trim(); const ln = lastName.trim();
      const { error } = await supabase.from('profiles').update({
        first_name: fn, last_name: ln, full_name: `${fn} ${ln}`,
        phone: toYemenPhone(phone),
        latitude: loc.latitude, longitude: loc.longitude, city: loc.city,
      }).eq('user_id', userId);
      if (error) {
        if (error.message?.includes('PHONE_ALREADY_USED') || error.code === '23505') {
          setPhoneCheck('taken'); setStep(2);
          toast({ title: 'الرقم مستخدم', description: 'هذا الرقم مسجل لحساب آخر.', variant: 'destructive' });
          return;
        }
        throw error;
      }
      toast({ title: 'مرحباً بك!', description: 'تم إكمال بياناتك بنجاح' });
      onComplete();
    } catch {
      toast({ title: 'خطأ', description: 'تعذر حفظ البيانات، حاول مرة أخرى', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const steps = ['الاسم', 'الجوال', 'الموقع'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 font-arabic" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">أكمل بياناتك</h1>
          <p className="text-sm text-muted-foreground mt-2">خطوة {step} من 3 — {steps[step - 1]}</p>
        </div>
        <Progress value={(step / 3) * 100} className="mb-4 h-2" />
        <div className="flex justify-between mb-4 text-xs">
          {steps.map((s, i) => (
            <span key={s} className={i + 1 <= step ? 'text-primary font-semibold' : 'text-muted-foreground'}>
              {i + 1}. {s}
            </span>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-lg p-6 space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="first-name" className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />الاسم الأول</Label>
                <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="مثال: عبدالله" maxLength={40} autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />اللقب</Label>
                <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="مثال: الوحدي" maxLength={40} />
              </div>
              <Button className="w-full h-12" disabled={!nameValid} onClick={() => setStep(2)}>التالي</Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone-input" className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />رقم الجوال</Label>
                <div className="flex items-stretch gap-2" dir="ltr">
                  <div className="flex items-center gap-1.5 px-3 rounded-md border border-input bg-muted/50 text-sm font-medium shrink-0 select-none">
                    <span>🇾🇪</span><span>+967</span>
                  </div>
                  <Input id="phone-input" type="tel" inputMode="numeric" autoFocus value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="7XXXXXXXX" maxLength={9} className="text-center tracking-wider" />
                </div>
                <div className="text-xs min-h-[1rem]">
                  {!phoneFormatValid && <span className="text-muted-foreground">9 أرقام تبدأ بـ 7</span>}
                  {phoneCheck === 'checking' && <span className="text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />جاري التحقق...</span>}
                  {phoneCheck === 'available' && <span className="text-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />الرقم متاح</span>}
                  {phoneCheck === 'taken' && <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" />هذا الرقم مسجل لحساب آخر</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowRight className="w-4 h-4" /></Button>
                <Button className="flex-1 h-12" disabled={phoneCheck !== 'available'} onClick={() => setStep(3)}>التالي</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />موقعك الحالي</Label>
                <p className="text-xs text-muted-foreground">نستخدم موقعك لعرض المنتجات القريبة منك. يجب السماح بإذن الموقع.</p>
                {loc.status === 'loading' && (
                  <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />جاري تحديد موقعك...
                  </div>
                )}
                {loc.status === 'ready' && (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-md border border-primary/30 bg-primary/10 text-sm">
                    <span className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-primary" />{loc.city}</span>
                    <button type="button" onClick={captureLocation} className="text-xs text-primary hover:underline">تحديث</button>
                  </div>
                )}
                {loc.status === 'error' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-md border border-destructive/30 bg-destructive/10 text-sm text-destructive">{loc.message}</div>
                    <Button type="button" variant="outline" size="sm" onClick={captureLocation} className="w-full">
                      <MapPin className="w-4 h-4 ml-2" />إعادة المحاولة
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowRight className="w-4 h-4" /></Button>
                <Button className="flex-1 h-12" disabled={loc.status !== 'ready' || saving} onClick={handleSubmit}>
                  {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}حفظ ومتابعة
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
