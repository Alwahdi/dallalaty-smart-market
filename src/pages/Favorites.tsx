import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart, ArrowLeft, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import PropertyCardNew from '@/components/PropertyCardNew';
import { useFavorites } from '@/hooks/useFavorites';
import { SwipeToDelete } from '@/components/SwipeToDelete';

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  location?: string;
  city?: string;
  neighborhood?: string;
  category?: string;
  listing_type?: string;
  images: string[];
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
  custom_data?: Record<string, any>;
}

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(false);
  const { favorites, loading, removeFromFavorites } = useFavorites();

  // Redirect unauthenticated users
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    await removeFromFavorites(propertyId);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      
      {/* Mobile Header */}
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button variant="outline" size="sm" className="ml-4">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-arabic flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                العروض المفضلة
              </h1>
              <p className="text-muted-foreground font-arabic">
                العروض التي أضفتها إلى قائمة المفضلات ({favorites.length} عرض)
              </p>
            </div>
          </div>

          {/* Content */}
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-arabic mb-4">
                لا توجد عروض مفضلة بعد
              </h2>
              <p className="text-muted-foreground font-arabic mb-6 max-w-md mx-auto">
                ابدأ بتصفح العروض وإضافة المناسب منها إلى قائمة المفضلات لسهولة المتابعة
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/properties">
                  <Button className="font-arabic flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    تصفح العروض
                  </Button>
                </Link>
                <Link to="/properties?category=real-estate">
                  <Button variant="outline" className="font-arabic">
                    عناصر
                  </Button>
                </Link>
                <Link to="/properties?category=cars">
                  <Button variant="outline" className="font-arabic">
                    سيارات
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((property, index) => (
                <div 
                  key={property.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <SwipeToDelete
                    onDelete={() => handleRemoveFavorite(property.id)}
                    className="w-full"
                    shareData={{
                      title: property.title,
                      text: `${property.description || ''} - السعر: ${property.price ? new Intl.NumberFormat('ar-SA').format(property.price) : 'غير محدد'} ريال`,
                      url: `${window.location.origin}/product/${property.id}`
                    }}
                    deleteConfirmation={{
                      title: "إزالة من المفضلة",
                      description: "هل أنت متأكد من أنك تريد إزالة هذا العنصر من قائمة المفضلات؟"
                    }}
                  >
                    <div className="relative group">
                      <PropertyCardNew property={property} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(property.id)}
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500/80 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </SwipeToDelete>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}