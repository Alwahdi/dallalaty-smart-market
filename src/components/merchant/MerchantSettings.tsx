import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store, User } from 'lucide-react';

interface MerchantSettingsProps {
  merchantId: string;
}

const isValidUrl = (v: string) => {
  try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; }
};

/** Store-facing details. Name and phone are personal identity and are edited only in Account settings. */
export default function MerchantSettings({ merchantId }: MerchantSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [identity, setIdentity] = useState({ full_name: '', phone: '' });
  const [form, setForm] = useState({ bio: '', city: '', location: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, bio, city, location, website')
        .eq('user_id', merchantId)
        .maybeSingle();
      if (error) setLoadError(true);
      if (data) {
        setIdentity({ full_name: data.full_name || '', phone: data.phone || '' });
        setForm({ bio: data.bio || '', city: data.city || '', location: data.location || '', website: data.website || '' });
      }
      setLoading(false);
    })();
  }, [merchantId]);

  const save = async () => {
    const errs: Record<string, string> = {};
    const website = form.website.trim();
    if (website && !isValidUrl(website)) errs.website = 'اكتب رابطاً كاملاً يبدأ بـ https://';
    if (form.bio.length > 500) errs.bio = 'النبذة يجب ألا تتجاوز 500 حرف';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      bio: form.bio.trim() || null,
      city: form.city.trim() || null,
      location: form.location.trim() || null,
      website: website || null,
    }).eq('user_id', merchantId);
    setSaving(false);
    toast(error
      ? { title: 'تعذر الحفظ', description: 'حاول مرة أخرى', variant: 'destructive' }
      : { title: 'تم حفظ معلومات المتجر' });
  };

  if (loading) {
    return <Card><CardContent role="status" className="py-10 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />جاري التحميل...</CardContent></Card>;
  }
  if (loadError) {
    return <Card><CardContent role="alert" className="py-10 text-center text-destructive">تعذر تحميل الإعدادات. أعد تحميل الصفحة.</CardContent></Card>;
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Store className="w-5 h-5 text-primary-text" />
          <h3 className="font-semibold">معلومات المتجر</h3>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{identity.full_name || '—'}</p>
            <p className="text-xs text-muted-foreground" dir="ltr">{identity.phone || '—'}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/account"><User className="w-4 h-4" />تعديل الاسم والرقم</Link>
          </Button>
        </div>

        <div>
          <Label htmlFor="ms-city">المدينة</Label>
          <Input id="ms-city" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="ms-loc">العنوان</Label>
          <Input id="ms-loc" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="ms-web">الموقع الإلكتروني</Label>
          <Input id="ms-web" type="url" aria-invalid={!!errors.website} placeholder="https://" value={form.website}
            onChange={e => setForm(p => ({ ...p, website: e.target.value }))} dir="ltr" className="mt-1.5" />
          {errors.website && <p role="alert" className="text-xs text-destructive mt-1">{errors.website}</p>}
        </div>
        <div>
          <Label htmlFor="ms-bio">نبذة عن المتجر</Label>
          <Textarea id="ms-bio" maxLength={500} aria-invalid={!!errors.bio} value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={4} className="mt-1.5" />
          <p className="text-xs text-muted-foreground mt-1 text-end">{form.bio.length}/500</p>
        </div>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving && <Loader2 className="w-4 h-4 me-2 animate-spin" />} حفظ التغييرات
        </Button>
      </CardContent>
    </Card>
  );
}
