import { ReactNode, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMerchantContext } from '@/hooks/useMerchantContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface MerchantGuardProps {
  children: ReactNode;
}

export default function MerchantGuard({ children }: MerchantGuardProps) {
  const { merchantId } = useParams();
  const { loading, hasMerchantAccess, effectiveAgentId, isAdmin } = useMerchantContext(merchantId);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    if (!hasMerchantAccess) {
      toast({
        title: 'هذه الصفحة للتجار فقط',
        description: 'لا تمتلك صلاحية الوصول للوحة التاجر',
        variant: 'destructive',
      });
      navigate('/', { replace: true });
      return;
    }

    // If a specific merchantId is in URL, ensure user can act under it
    if (merchantId && !effectiveAgentId && !isAdmin) {
      toast({
        title: 'لا تمتلك صلاحية',
        description: 'لست موظفاً عند هذا التاجر',
        variant: 'destructive',
      });
      navigate('/merchant', { replace: true });
    }
  }, [loading, hasMerchantAccess, effectiveAgentId, merchantId, isAdmin, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary-text" />
      </div>
    );
  }

  if (!hasMerchantAccess) return null;

  return <>{children}</>;
}
