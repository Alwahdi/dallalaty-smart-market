import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, ArrowRight, Search } from 'lucide-react';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import PropertyCardNew from '@/components/PropertyCardNew';
import { useFavorites } from '@/hooks/useFavorites';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import { formatPrice } from '@/lib/currency';
import { formatNumber } from '@/lib/format';

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { favorites, loading, error, fetchFavorites, removeFromFavorites } = useFavorites();

  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background font-arabic" dir="rtl">
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} />

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3 mb-6">
            <Button asChild variant="outline" size="icon" aria-label="العودة للرئيسية" className="shrink-0">
              <Link to="/"><ArrowRight className="w-5 h-5" /></Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Heart className="w-7 h-7 text-primary-text shrink-0" />
                المفضلة
              </h1>
              {!loading && !error && (
                <p className="text-sm text-muted-foreground">{formatNumber(favorites.length)} عنصر محفوظ</p>
              )}
            </div>
          </div>

          {authLoading || loading ? (
            <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" /> جاري تحميل المفضلة...
            </div>
          ) : error ? (
            <div role="alert" className="text-center py-16 space-y-4">
              <p className="text-foreground font-semibold">تعذر تحميل المفضلة</p>
              <Button onClick={() => fetchFavorites()}>إعادة المحاولة</Button>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">لا توجد عناصر في المفضلة بعد</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                اضغط على أيقونة القلب في أي عنصر لحفظه هنا والرجوع إليه لاحقاً.
              </p>
              <Button asChild>
                <Link to="/properties"><Search className="w-4 h-4" />تصفح العناصر</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {favorites.map((property) => (
                <SwipeToDelete
                  key={property.id}
                  onDelete={() => removeFromFavorites(property.id)}
                  className="w-full"
                  shareData={{
                    title: property.title,
                    text: `${property.title} - ${formatPrice(property.price, property.currency)}`,
                    url: `${window.location.origin}/product/${property.id}`,
                  }}
                  deleteConfirmation={{
                    title: 'إزالة من المفضلة',
                    description: 'هل تريد إزالة هذا العنصر من المفضلة؟',
                  }}
                >
                  <PropertyCardNew property={property} />
                </SwipeToDelete>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
