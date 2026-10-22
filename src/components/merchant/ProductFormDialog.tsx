import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import MediaUpload from '@/components/MediaUpload';
import DynamicFormFields from '@/components/admin/DynamicFormFields';
import { CustomField } from '@/components/admin/CustomFieldsEditor';
import { Tables } from '@/integrations/supabase/types';
import { Loader2, ImagePlus, Building2 } from 'lucide-react';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import { YEMEN_LOCAL_PHONE, toYemenPhone, fromYemenPhone, isRentListing } from '@/lib/format';

const FieldError = ({ msg }: { msg?: string }) => (msg ? <p role="alert" className="text-xs text-destructive mt-1">{msg}</p> : null);

type Property = Tables<'properties'>;

interface Category {
  id: string;
  title: string;
  slug: string;
  custom_fields?: CustomField[];
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  editingProduct?: Property | null;
  onSaved: () => void;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  agentId,
  editingProduct,
  onSaved,
}: ProductFormDialogProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    price: '',
    currency: 'YER' as CurrencyCode,
    listing_type: 'sale',
    location: '',
    city: '',
    neighborhood: '',
    description: '',
    agent_name: '',
    agent_phone: '',
    agent_email: '',
    category: '',
    status: 'active',
  });
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [customData, setCustomData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileDefaults, setProfileDefaults] = useState({ name: '', phone: '' });

  useEffect(() => {
    supabase.from('profiles').select('full_name, phone').eq('user_id', agentId).maybeSingle()
      .then(({ data }) => { if (data) setProfileDefaults({ name: data.full_name || '', phone: fromYemenPhone(data.phone) }); });
  }, [agentId]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, title, slug, custom_fields')
        .eq('status', 'active');
      setCategories(
        ((data as any[]) || []).map(c => ({
          ...c,
          custom_fields: Array.isArray(c.custom_fields) ? c.custom_fields : [],
        }))
      );
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      setForm({
        title: editingProduct.title,
        price: editingProduct.price.toString(),
        currency: ((editingProduct as any).currency as CurrencyCode) || 'YER',
        listing_type: isRentListing(editingProduct.listing_type) ? 'rent' : 'sale',
        location: editingProduct.location || '',
        city: editingProduct.city || '',
        neighborhood: editingProduct.neighborhood || '',
        description: editingProduct.description || '',
        agent_name: editingProduct.agent_name || '',
        agent_phone: fromYemenPhone(editingProduct.agent_phone),
        agent_email: editingProduct.agent_email || '',
        category: editingProduct.category || '',
        status: editingProduct.status || 'active',
      });
      setImages(editingProduct.images || []);
      setVideos(editingProduct.videos || []);
      setCustomData((editingProduct.custom_data as Record<string, any>) || {});
    } else {
      setForm({
        title: '', price: '', currency: 'YER', listing_type: 'sale', location: '', city: '',
        neighborhood: '', description: '', agent_name: profileDefaults.name, agent_phone: profileDefaults.phone,
        agent_email: '', category: '', status: 'active',
      });
      setImages([]);
      setVideos([]);
      setCustomData({});
      setSelectedCategory(null);
    }
    setErrors({});
  }, [open, editingProduct, profileDefaults]);

  useEffect(() => {
    const cat = categories.find(c => c.slug === form.category);
    setSelectedCategory(cat || null);
  }, [form.category, categories]);

  const save = async () => {
    const errs: Record<string, string> = {};
    const price = Number(form.price);
    if (form.title.trim().length < 3) errs.title = 'اكتب عنواناً واضحاً (3 أحرف على الأقل)';
    if (!Number.isFinite(price) || price <= 0) errs.price = 'أدخل سعراً صحيحاً أكبر من صفر';
    if (!form.category) errs.category = 'اختر القسم';
    if (!form.city.trim()) errs.city = 'المدينة مطلوبة';
    if (!YEMEN_LOCAL_PHONE.test(form.agent_phone)) errs.agent_phone = 'رقم جوال يمني صحيح: 9 أرقام تبدأ بـ 7';
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast({ title: 'راجع الحقول المحددة', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        title: form.title.trim(),
        city: form.city.trim(),
        neighborhood: form.neighborhood.trim() || null,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        agent_name: form.agent_name.trim() || null,
        agent_phone: toYemenPhone(form.agent_phone),
        price,
        images,
        videos,
        agent_id: agentId,
        custom_data: customData,
      };

      if (editingProduct) {
        const { error } = await supabase.from('properties').update(data).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: 'تم تحديث المنتج' });
      } else {
        const { error } = await supabase.from('properties').insert([data]);
        if (error) throw error;
        toast({ title: 'تمت إضافة المنتج' });
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message || 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-3xl h-[95vh] sm:h-auto sm:max-h-[90vh] p-0 gap-0 w-[95vw]">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-lg sm:text-xl">
            {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-4 sm:p-6">
          <div>
            <Label htmlFor="pf-title">عنوان المنتج *</Label>
            <Input id="pf-title" aria-invalid={!!errors.title} maxLength={120} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1.5" />
            <FieldError msg={errors.title} />
          </div>
          <div>
            <Label htmlFor="pf-price">السعر *</Label>
            <div className="flex gap-2 mt-1.5">
              <Input id="pf-price" type="number" inputMode="decimal" min={0} step="any" aria-invalid={!!errors.price} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="flex-1" placeholder="0" />
              <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v as CurrencyCode }))}>
                <SelectTrigger className="w-32" aria-label="العملة"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.symbol}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldError msg={errors.price} />
          </div>
          <div>
            <Label htmlFor="pf-type">نوع العرض</Label>
            <Select value={form.listing_type} onValueChange={v => setForm(p => ({ ...p, listing_type: v }))}>
              <SelectTrigger id="pf-type" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">للبيع</SelectItem>
                <SelectItem value="rent">للإيجار</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pf-category">القسم *</Label>
            <Select value={form.category} onValueChange={v => { setForm(p => ({ ...p, category: v })); setCustomData({}); }}>
              <SelectTrigger id="pf-category" aria-invalid={!!errors.category} className="mt-1.5"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.slug}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={errors.category} />
          </div>
          <div>
            <Label htmlFor="pf-city">المدينة *</Label>
            <Input id="pf-city" aria-invalid={!!errors.city} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="إب، صنعاء، تعز..." className="mt-1.5" />
            <FieldError msg={errors.city} />
          </div>
          <div>
            <Label htmlFor="pf-hood">الحي</Label>
            <Input id="pf-hood" value={form.neighborhood} onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))} className="mt-1.5" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="pf-loc">الموقع التفصيلي</Label>
            <Input id="pf-loc" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="mt-1.5" />
          </div>

          {selectedCategory && selectedCategory.custom_fields && selectedCategory.custom_fields.length > 0 && (
            <div className="md:col-span-2 border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-text" />
                <h4 className="font-semibold">حقول {selectedCategory.title}</h4>
              </div>
              <DynamicFormFields
                fields={selectedCategory.custom_fields}
                values={customData}
                onChange={(name, value) => setCustomData(p => ({ ...p, [name]: value }))}
              />
            </div>
          )}

          <div className="md:col-span-2">
            <Label htmlFor="pf-desc">الوصف</Label>
            <Textarea id="pf-desc" maxLength={3000} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className="mt-1.5" />
          </div>

          <div className="md:col-span-2">
            <Label className="flex items-center gap-2 mb-2"><ImagePlus className="w-4 h-4" /> الوسائط</Label>
            <MediaUpload
              images={images}
              videos={videos}
              onImagesChange={setImages}
              onVideosChange={setVideos}
              maxImages={10}
              maxVideos={2}
              bucketName="property-images"
              folder={agentId}
            />
          </div>

          <div>
            <Label htmlFor="pf-name">اسم التواصل</Label>
            <Input id="pf-name" value={form.agent_name} onChange={e => setForm(p => ({ ...p, agent_name: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pf-phone">هاتف التواصل (واتساب) *</Label>
            <div className="flex gap-2 mt-1.5" dir="ltr">
              <span className="flex items-center px-3 rounded-md border border-input bg-muted/50 text-sm font-medium select-none">+967</span>
              <Input id="pf-phone" type="tel" inputMode="numeric" aria-invalid={!!errors.agent_phone} value={form.agent_phone}
                onChange={e => setForm(p => ({ ...p, agent_phone: e.target.value.replace(/\D/g, '').slice(0, 9) }))} placeholder="7XXXXXXXX" />
            </div>
            <FieldError msg={errors.agent_phone} />
          </div>

          <div className="md:col-span-2 sticky bottom-0 bg-background pt-4 pb-2 border-t">
            <Button onClick={save} disabled={saving} className="w-full h-12 font-semibold">
              {saving && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
