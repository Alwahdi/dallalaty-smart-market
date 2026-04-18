import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Loader2, MapPin, User, CheckCircle2 } from 'lucide-react';

interface Props {
  userId: string;
  defaultFullName?: string;
  onComplete: () => void;
}

const YEMEN_LOCAL_REGEX = /^7\d{8}$/;

type LocState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; latitude: number; longitude: number; city: string }
  | { status: 'error'; message: string };

export default function MandatoryOnboarding({ userId, defaultFullName = '', onComplete }: Props) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(defaultFullName);
  const [phone, setPhone] = useState('');
  const [loc, setLoc] = useState<LocState>({ status: 'idle' });
  const [saving, setSaving] = useState(false);

  // Auto-request GPS on mount
  useEffect(() => {
    captureLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureLocation = () => {
    if (!('geolocation' in navigator)) {
      setLoc({ status: 'error', message: 'المتصفح لا يدعم تحديد الموقع' });
      return;
    }
    setLoc({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let city = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar&countrycodes=ye`,
          );
          const json = await res.json();
          const addr = json?.address ?? {};
          city = addr.city || addr.town || addr.village || addr.county || addr.state || 'غير معروف';
        } catch {
          city = 'غير معروف';
        }
        setLoc({ status: 'ready', latitude, longitude, city });
      },
      (err) => {
        setLoc({
          status: 'error',
          message:
            err.code === err.PERMISSION_DENIED
              ? 'تم رفض إذن الموقع. يجب السماح بالموقع لإكمال التسجيل.'
              : 'تعذر تحديد الموقع. حاول مرة أخرى.',
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
  };

  const isValid =
    fullName.trim().length >= 2 &&
    YEMEN_LOCAL_REGEX.test(phone) &&
    loc.status === 'ready';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loc.status !== 'ready') return;

    setSaving(true);
    const fullPhone = `+967${phone}`;

    try {
      // Phone uniqueness check
      const { data: existing } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('phone', fullPhone)
        .neq('user_id', userId)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'الرقم مستخدم',
          description: 'هذا الرقم مسجل لمستخدم آخر. الرجاء استخدام رقم آخر.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: fullPhone,
          latitude: loc.latitude,
          longitude: loc.longitude,
          city: loc.city,
        })
        .eq('user_id', userId);

      if (error) {
        if ((error as any).message?.includes('PHONE_ALREADY_USED') || (error as any).code === '23505') {
          toast({ title: 'الرقم مستخدم', description: 'هذا الرقم مسجل لمستخدم آخر.', variant: 'destructive' });
          setSaving(false);
          return;
        }
        throw error;
      }

      toast({ title: 'مرحباً بك! 🎉', description: 'تم إكمال بياناتك بنجاح' });
      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({ title: 'خطأ', description: 'حدث خطأ في حفظ البيانات', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 font-arabic" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">أكمل بياناتك للمتابعة</h1>
          <p className="text-sm text-muted-foreground mt-2">هذه البيانات مطلوبة لاستخدام التطبيق</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl shadow-lg p-6 space-y-5">
          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="full-name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              الاسم الكامل
            </Label>
            <Input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="اكتب اسمك الكامل"
              maxLength={80}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone-input" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              رقم الهاتف اليمني
            </Label>
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
                onChange={handlePhoneChange}
                placeholder="7XXXXXXXX"
                maxLength={9}
                className="text-center tracking-wider"
              />
            </div>
            <p className="text-xs text-muted-foreground">9 أرقام تبدأ بـ 7</p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              الموقع الجغرافي
            </Label>

            {loc.status === 'loading' && (
              <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري تحديد موقعك...
              </div>
            )}

            {loc.status === 'ready' && (
              <div className="flex items-center justify-between gap-2 p-3 rounded-md border border-green-500/30 bg-green-500/10 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{loc.city}</span>
                </div>
                <button
                  type="button"
                  onClick={captureLocation}
                  className="text-xs text-primary hover:underline"
                >
                  تحديث
                </button>
              </div>
            )}

            {loc.status === 'error' && (
              <div className="space-y-2">
                <div className="p-3 rounded-md border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                  {loc.message}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={captureLocation} className="w-full">
                  <MapPin className="w-4 h-4 ml-2" />
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {loc.status === 'idle' && (
              <Button type="button" variant="outline" onClick={captureLocation} className="w-full">
                <MapPin className="w-4 h-4 ml-2" />
                تحديد موقعي
              </Button>
            )}
          </div>

          <Button type="submit" className="w-full h-12" disabled={!isValid || saving}>
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ ومتابعة
          </Button>
        </form>
      </div>
    </div>
  );
}
