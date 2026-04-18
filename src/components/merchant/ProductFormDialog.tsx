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
    listing_type: 'للبيع',
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
        listing_type: editingProduct.listing_type || 'للبيع',
        location: editingProduct.location || '',
        city: editingProduct.city || '',
        neighborhood: editingProduct.neighborhood || '',
        description: editingProduct.description || '',
        agent_name: editingProduct.agent_name || '',
        agent_phone: editingProduct.agent_phone || '',
        agent_email: editingProduct.agent_email || '',
        category: editingProduct.category || '',
        status: editingProduct.status || 'active',
      });
      setImages(editingProduct.images || []);
      setVideos(editingProduct.videos || []);
      setCustomData((editingProduct.custom_data as Record<string, any>) || {});
    } else {
      setForm({
        title: '', price: '', listing_type: 'للبيع', location: '', city: '',
        neighborhood: '', description: '', agent_name: '', agent_phone: '',
        agent_email: '', category: '', status: 'active',
      });
      setImages([]);
      setVideos([]);
      setCustomData({});
      setSelectedCategory(null);
    }
  }, [open, editingProduct]);

  useEffect(() => {
    const cat = categories.find(c => c.slug === form.category);
    setSelectedCategory(cat || null);
  }, [form.category, categories]);

  const save = async () => {
    if (!form.title || !form.price || !form.category || !form.city) {
      toast({ title: 'حقول ناقصة', description: 'العنوان والسعر والقسم والمدينة مطلوبة', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        images,
        videos,
        agent_id: agentId,
        custom_data: customData,
      };

      if (editingProduct) {
        const { error } = await supabase.from('properties').update(data).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: '✅ تم التحديث' });
      } else {
        const { error } = await supabase.from('properties').insert([data]);
        if (error) throw error;
        toast({ title: '✅ تم إضافة المنتج' });
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
            <Label>عنوان المنتج *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label>السعر *</Label>
            <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label>نوع العرض</Label>
            <Select value={form.listing_type} onValueChange={v => setForm(p => ({ ...p, listing_type: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="للبيع">للبيع</SelectItem>
                <SelectItem value="للإيجار">للإيجار</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>القسم *</Label>
            <Select value={form.category} onValueChange={v => { setForm(p => ({ ...p, category: v })); setCustomData({}); }}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.slug}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>المدينة *</Label>
            <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="إب، صنعاء، تعز..." className="mt-1.5" />
          </div>
          <div>
            <Label>الحي</Label>
            <Input value={form.neighborhood} onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))} className="mt-1.5" />
          </div>
          <div className="md:col-span-2">
            <Label>الموقع التفصيلي</Label>
            <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="mt-1.5" />
          </div>

          {selectedCategory && selectedCategory.custom_fields && selectedCategory.custom_fields.length > 0 && (
            <div className="md:col-span-2 border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
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
            <Label>الوصف</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className="mt-1.5" />
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
            <Label>اسم التواصل</Label>
            <Input value={form.agent_name} onChange={e => setForm(p => ({ ...p, agent_name: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label>هاتف التواصل</Label>
            <Input value={form.agent_phone} onChange={e => setForm(p => ({ ...p, agent_phone: e.target.value }))} placeholder="7xxxxxxxx" className="mt-1.5" dir="ltr" />
          </div>

          <div className="md:col-span-2 sticky bottom-0 bg-background pt-4 pb-2 border-t">
            <Button onClick={save} disabled={saving} className="w-full h-12 font-semibold">
              {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
