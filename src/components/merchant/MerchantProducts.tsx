import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ProductFormDialog from './ProductFormDialog';
import { MerchantPermissions } from '@/hooks/useMerchantContext';
import { formatPrice } from '@/lib/currency';
import ImagePreview from '@/components/ImagePreview';

type Property = Tables<'properties'>;

interface MerchantProductsProps {
  agentId: string;
  permissions: MerchantPermissions;
}

export default function MerchantProducts({ agentId, permissions }: MerchantProductsProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [agentId]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('properties').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
    toast({ title: '✅ تم التحديث' });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم الحذف' });
    fetchProducts();
  };

  const filtered = products.filter(p => {
    const ok = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(search.toLowerCase());
    const okStatus = statusFilter === 'all' || p.status === statusFilter;
    return ok && okStatus;
  });

  const openEdit = (p: Property) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ابحث في منتجاتك..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="sold">مباع</SelectItem>
          </SelectContent>
        </Select>
        {permissions.can_add_products && (
          <Button onClick={openAdd} className="gap-2 shrink-0"><Plus className="w-4 h-4" /> إضافة منتج</Button>
        )}
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">جاري التحميل...</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-14 h-14 mx-auto opacity-20 mb-3" />
            <p className="font-semibold mb-1">لا توجد منتجات</p>
            <p className="text-sm text-muted-foreground mb-4">{search ? 'جرب بحث آخر' : 'ابدأ بإضافة منتجك الأول'}</p>
            {!search && permissions.can_add_products && (
              <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> إضافة منتج</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {p.images && p.images[0] ? (
                    <div className="w-20 h-20 shrink-0 overflow-hidden rounded-lg"><ImagePreview images={p.images} alt={p.title} /></div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="w-7 h-7 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2 mb-1">{p.title}</h3>
                    <p className="text-primary-text font-bold mb-2">{formatPrice(p.price, (p as any).currency)}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={p.status} onValueChange={v => updateStatus(p.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue>
                            <Badge variant={p.status === 'active' ? 'default' : 'outline'} className="text-xs">
                              {p.status === 'active' ? 'نشط' : p.status === 'sold' ? 'مباع' : p.status === 'rented' ? 'مؤجر' : p.status === 'pending' ? 'مراجعة' : 'متوقف'}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="sold">مباع</SelectItem>
                          <SelectItem value="rented">مؤجر</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">{p.city}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                  {permissions.can_edit_products && (
                    <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="gap-1.5">
                      <Edit className="w-4 h-4" /> تعديل
                    </Button>
                  )}
                  {permissions.can_delete_products && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-1.5">
                          <Trash2 className="w-4 h-4" /> حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl" className="max-w-[90vw] sm:max-w-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف "{p.title}"؟</AlertDialogTitle>
                          <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(p.id)}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agentId={agentId}
        editingProduct={editing}
        onSaved={fetchProducts}
      />
    </div>
  );
}
