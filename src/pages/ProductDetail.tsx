import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Loader2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesCache } from '@/hooks/useLocalStorage';
import { useRouteTracking } from '@/hooks/useRouteTracking';
import DynamicPropertyDisplay from '@/components/DynamicPropertyDisplay';
import type { CustomField } from '@/components/admin/CustomFieldsEditor';
import { formatPrice } from '@/lib/currency';
import ImagePreview from '@/components/ImagePreview';
import { useFavorites } from '@/hooks/useFavorites';
import { toYemenDialDigits } from '@/lib/format';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: string | null;
  category: string;
  location: string;
  city: string;
  neighborhood: string;
  images: string[];
  videos?: string[];
  listing_type: string;
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  custom_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Cache hooks
  const { isDark, toggleTheme } = useTheme();
  const { addToCache, removeFromCache } = useFavoritesCache();
  useRouteTracking();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [categoryFields, setCategoryFields] = useState<CustomField[]>([]);
  const [categoryLabel, setCategoryLabel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = !!id && isFavorite(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id, user]);

  const fetchProperty = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) { setProperty(null); return; }
      setProperty(data as any);

      // Fetch category custom fields for dynamic display
      if (data?.category) {
        const { data: cat } = await supabase
          .from('categories')
          .select('title, custom_fields')
          .eq('slug', data.category)
          .maybeSingle();
        if (cat) {
          setCategoryLabel(cat.title || data.category);
          const fields = (cat.custom_fields as any) || [];
          setCategoryFields(Array.isArray(fields) ? fields : []);
        }
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!id || likeBusy) return;
    setLikeBusy(true);
    const ok = await toggleFavorite(id);
    if (ok) (isLiked ? removeFromCache(id) : addToCache(id));
    setLikeBusy(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الرابط"
      });
    }
  };

  const dial = toYemenDialDigits(property?.agent_phone);
  const whatsappHref = property && dial
    ? `https://wa.me/${dial}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن: ${property.title} - ${formatPrice(property.price, property.currency)}`)}`
    : null;

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background font-arabic" dir="rtl">
      <div className="hidden md:block"><HeaderNew isDark={isDark} toggleTheme={toggleTheme} /></div>
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} />
      {children}
      <BottomNavigation />
    </div>
  );


  const getCategoryLabel = (category: string) => {
    if (categoryLabel) return categoryLabel;
    return category;
  };

  const nextImage = () => {
    if (property) {
      const totalMedia = (property.videos?.length || 0) + property.images.length;
      if (totalMedia > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % totalMedia);
      }
    }
  };

  const prevImage = () => {
    if (property) {
      const totalMedia = (property.videos?.length || 0) + property.images.length;
      if (totalMedia > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
      }
    }
  };

  if (loading) {
    return shell(
      <div role="status" className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> جاري التحميل...
      </div>
    );
  }

  if (loadError) {
    return shell(
      <div role="alert" className="container mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold">تعذر تحميل العنصر</h1>
        <p className="text-muted-foreground">تحقق من اتصالك بالإنترنت ثم أعد المحاولة.</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={fetchProperty}>إعادة المحاولة</Button>
          <Button variant="outline" onClick={() => navigate('/properties')}>العودة للعناصر</Button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={`min-h-screen bg-background font-arabic `} dir="rtl">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">العنصر غير موجود</h1>
          <Button onClick={() => navigate('/properties')}>
            العودة للعناصر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic `} dir="rtl">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      
      {/* Mobile Header */}
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} />
      
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-foreground">العروض</Link>
          <span>/</span>
          <span className="text-foreground">{getCategoryLabel(property.category)}</span>
        </nav>

        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6 font-arabic"
        >
          <ArrowRight className="w-4 h-4 me-2" />
          العودة
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images & Videos Section */}
          <div className="lg:col-span-2">
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-card">
              {((property.images && property.images.length > 0) || (property.videos && property.videos.length > 0)) ? (
                <>
                  <div className="relative aspect-video">
                    {property.videos && property.videos.length > 0 && currentImageIndex < property.videos.length ? (
                      <video
                        src={property.videos[currentImageIndex]}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                    ) : (
                      <ImagePreview
                        images={property.images}
                        index={currentImageIndex - (property.videos?.length || 0)}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Navigation Arrows */}
                    {((property.videos?.length || 0) + property.images.length) > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          aria-label="الصورة السابقة"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background touch-manipulation rounded-full"
                          onClick={prevImage}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          aria-label="الصورة التالية"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background touch-manipulation rounded-full"
                          onClick={nextImage}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                      </>
                    )}

                    {/* Media Counter */}
                    {((property.videos?.length || 0) + property.images.length) > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                        {currentImageIndex + 1} من {(property.videos?.length || 0) + property.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {((property.videos?.length || 0) + property.images.length) > 1 && (
                    <div className="p-4">
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {property.videos?.map((video, index) => (
                          <button
                            key={`video-${index}`}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 touch-manipulation ${
                              index === currentImageIndex ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <video
                              src={video}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                              <Play className="w-4 h-4 text-background" />
                            </div>
                          </button>
                        ))}
                        {property.images.map((image, index) => (
                          <Button variant="ghost" type="button" aria-label={`معاينة صورة ${index + 1}`}
                            key={`image-${index}`}
                            onClick={() => setCurrentImageIndex((property.videos?.length || 0) + index)}
                            className={`flex-shrink-0 w-20 h-20 p-0 rounded-lg overflow-hidden border-2 touch-manipulation ${
                              (property.videos?.length || 0) + index === currentImageIndex ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`صورة ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Description */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 font-arabic">التفاصيل</h3>
                <p className="text-muted-foreground leading-relaxed font-arabic">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Main Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="font-arabic">
                    {getCategoryLabel(property.category)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="مشاركة"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="icon"
                      aria-label={isLiked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      aria-pressed={isLiked}
                      disabled={likeBusy}
                      onClick={toggleLike}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-4 font-arabic">
                  {property.title}
                </h1>

                <div className="text-3xl font-bold text-primary-text mb-4">
                  {formatPrice(property.price, property.currency)}
                </div>

                <div className="flex items-center text-muted-foreground mb-6">
                  <MapPin className="w-4 h-4 me-2" />
                  <span className="font-arabic">{property.location}</span>
                </div>

                {whatsappHref ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button asChild className="w-full font-arabic" size="lg">
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-5 h-5 me-2" />تواصل عبر واتساب</a>
                    </Button>
                    <Button asChild variant="outline" className="w-full font-arabic" size="lg">
                      <a href={`tel:+${dial}`}><Phone className="w-5 h-5 me-2" />اتصال</a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground rounded-md bg-muted/50 p-3 text-center">لم يضف البائع رقم تواصل لهذا العنصر.</p>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Specs from category custom fields */}
            {categoryFields.length > 0 && property.custom_data && Object.keys(property.custom_data).length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 font-arabic">المواصفات</h3>
                  <DynamicPropertyDisplay
                    fields={categoryFields}
                    data={property.custom_data}
                    variant="detail"
                  />
                </CardContent>
              </Card>
            )}

            {/* Agent Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 font-arabic">معلومات البائع</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 me-2 text-muted-foreground" />
                    <span className="font-arabic">{property.agent_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 me-2 text-muted-foreground" />
                    <span dir="ltr">{dial ? `+${dial}` : 'غير متوفر'}</span>
                  </div>
                  {property.agent_email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 me-2 text-muted-foreground" />
                      <span dir="ltr">{property.agent_email}</span>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}