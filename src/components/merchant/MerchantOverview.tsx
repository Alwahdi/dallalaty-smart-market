import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Eye, Plus, TrendingUp, Users } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { formatPrice } from '@/lib/currency';
import ImagePreview from '@/components/ImagePreview';

type Property = Tables<'properties'>;

interface Stats {
  total: number;
  active: number;
  inactive: number;
  sold: number;
}

interface MerchantOverviewProps {
  agentId: string;
  employeesCount: number;
  canAdd: boolean;
  onAddProduct: () => void;
  onGoToProducts: () => void;
}

export default function MerchantOverview({
  agentId,
  employeesCount,
  canAdd,
  onAddProduct,
  onGoToProducts,
}: MerchantOverviewProps) {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, sold: 0 });
  const [recent, setRecent] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      const list = data || [];
      setStats({
        total: list.length,
        active: list.filter(p => p.status === 'active').length,
        inactive: list.filter(p => p.status === 'inactive' || p.status === 'pending').length,
        sold: list.filter(p => p.status === 'sold' || p.status === 'rented').length,
      });
      setRecent(list.slice(0, 5));
      setLoading(false);
    };
    fetch();
  }, [agentId]);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold">{value.toLocaleString('ar-YE-u-nu-latn')}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="إجمالي المنتجات" value={stats.total} color="bg-primary/10 text-primary" />
        <StatCard icon={TrendingUp} label="نشطة" value={stats.active} color="bg-green-500/10 text-green-600" />
        <StatCard icon={Eye} label="غير نشطة" value={stats.inactive} color="bg-orange-500/10 text-orange-600" />
        <StatCard icon={Users} label="الموظفون" value={employeesCount} color="bg-blue-500/10 text-blue-600" />
      </div>

      {canAdd && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base mb-1">ابدأ ببيع منتجاتك</h3>
              <p className="text-sm text-muted-foreground">أضف منتجاً جديداً ليظهر للزبائن فوراً</p>
            </div>
            <Button onClick={onAddProduct} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> إضافة منتج
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">آخر المنتجات</h3>
            <Button variant="ghost" size="sm" onClick={onGoToProducts}>عرض الكل</Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">جاري التحميل...</p>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm">لا توجد منتجات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  {p.images && p.images[0] ? (
                    <div className="w-12 h-12 shrink-0 overflow-hidden rounded-lg"><ImagePreview images={p.images} alt={p.title} /></div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(p.price, (p as any).currency)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {p.status === 'active' ? 'نشط' : p.status === 'sold' ? 'مباع' : 'متوقف'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
