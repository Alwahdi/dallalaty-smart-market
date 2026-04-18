import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantContext } from '@/hooks/useMerchantContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Store, ArrowRight, Package, Users, Settings, LayoutDashboard } from 'lucide-react';
import MerchantOverview from '@/components/merchant/MerchantOverview';
import MerchantProducts from '@/components/merchant/MerchantProducts';
import MerchantEmployees from '@/components/merchant/MerchantEmployees';
import MerchantSettings from '@/components/merchant/MerchantSettings';

export default function MerchantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { merchantId: urlMerchantId } = useParams();
  const [activeMerchantId, setActiveMerchantId] = useState<string | undefined>(urlMerchantId);
  const ctx = useMerchantContext(activeMerchantId);
  const [tab, setTab] = useState('overview');
  const [employeesCount, setEmployeesCount] = useState(0);

  useEffect(() => {
    if (urlMerchantId) setActiveMerchantId(urlMerchantId);
  }, [urlMerchantId]);

  // Fetch employees count for stats
  useEffect(() => {
    if (!ctx.effectiveAgentId) return;
    supabase
      .from('merchant_employees')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', ctx.effectiveAgentId)
      .then(({ count }) => setEmployeesCount(count || 0));
  }, [ctx.effectiveAgentId, tab]);

  if (ctx.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ctx.hasMerchantAccess || !ctx.effectiveAgentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center" dir="rtl">
        <div className="space-y-3">
          <Store className="w-14 h-14 text-muted-foreground mx-auto opacity-40" />
          <p className="text-lg font-semibold">لا تمتلك صلاحية الوصول للوحة التاجر</p>
          <Button onClick={() => navigate('/')} variant="outline">العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const isOwner = ctx.isOwnerOfActive;
  const showEmployeesTab = isOwner || ctx.permissions.can_manage_employees || ctx.isAdmin;
  const showSettingsTab = isOwner || ctx.isAdmin;

  // Build employer options (own store + employer merchants)
  const merchantOptions: { id: string; label: string }[] = [];
  if (ctx.isMerchant && user) merchantOptions.push({ id: user.id, label: 'متجري' });
  ctx.employerMerchants.forEach(em =>
    merchantOptions.push({ id: em.merchant_id, label: em.merchant_name || 'تاجر' })
  );

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Store className="w-5 h-5 text-primary shrink-0" />
          <h1 className="font-bold text-base sm:text-lg flex-1 truncate">لوحة التاجر</h1>
          {merchantOptions.length > 1 && (
            <Select value={ctx.effectiveAgentId} onValueChange={setActiveMerchantId}>
              <SelectTrigger className="w-36 sm:w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {merchantOptions.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-3 sm:p-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:flex sm:w-auto h-auto p-1 gap-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <LayoutDashboard className="w-4 h-4" /> نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 text-xs sm:text-sm">
              <Package className="w-4 h-4" /> منتجاتي
            </TabsTrigger>
            {showEmployeesTab && (
              <TabsTrigger value="employees" className="gap-1.5 text-xs sm:text-sm">
                <Users className="w-4 h-4" /> الموظفون
              </TabsTrigger>
            )}
            {showSettingsTab && (
              <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
                <Settings className="w-4 h-4" /> الإعدادات
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <MerchantOverview
              agentId={ctx.effectiveAgentId}
              employeesCount={employeesCount}
              canAdd={ctx.permissions.can_add_products}
              onAddProduct={() => setTab('products')}
              onGoToProducts={() => setTab('products')}
            />
          </TabsContent>

          <TabsContent value="products">
            <MerchantProducts agentId={ctx.effectiveAgentId} permissions={ctx.permissions} />
          </TabsContent>

          {showEmployeesTab && (
            <TabsContent value="employees">
              <MerchantEmployees merchantId={ctx.effectiveAgentId} />
            </TabsContent>
          )}

          {showSettingsTab && (
            <TabsContent value="settings">
              <MerchantSettings merchantId={ctx.effectiveAgentId} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
