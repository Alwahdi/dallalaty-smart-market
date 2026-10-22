import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store } from 'lucide-react';

interface MerchantSettingsProps {
  merchantId: string;
}

export default function MerchantSettings({ merchantId }: MerchantSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    bio: '',
    city: '',
    location: '',
    website: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, bio, city, location, website')
        .eq('user_id', merchantId)
        .maybeSingle();
      if (data) {
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          city: data.city || '',
          location: data.location || '',
          website: data.website || '',
        });
      }
      setLoading(false);
    };
    fetch();
  }, [merchantId]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update(form).eq('user_id', merchantId);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ تم الحفظ' });
    }
    setSaving(false);
  };

  if (loading) {
    return <Card><CardContent className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Store className="w-5 h-5 text-primary-text" />
          <h3 className="font-semibold">معلومات المتجر</h3>
        </div>

        <div>
          <Label>اسم المتجر</Label>
          <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>رقم التواصل</Label>
          <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} dir="ltr" className="mt-1.5" />
        </div>
        <div>
          <Label>المدينة</Label>
          <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>العنوان</Label>
          <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>الموقع الإلكتروني</Label>
          <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} dir="ltr" className="mt-1.5" />
        </div>
        <div>
          <Label>نبذة عن المتجر</Label>
          <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={4} className="mt-1.5" />
        </div>

        <Button onClick={save} disabled={saving} className="w-full h-11">
          {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />} حفظ التغييرات
        </Button>
      </CardContent>
    </Card>
  );
}
