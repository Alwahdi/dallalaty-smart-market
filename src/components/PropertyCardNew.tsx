import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, MessageCircle, Share2, Eye, Bed, Bath, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  location?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  images: string[];
  amenities?: string[];
  listing_type?: string | null;
  agent_name?: string | null;
  agent_phone?: string | null;
  agent_email?: string | null;
  category?: string;
  custom_data?: Record<string, any> | any;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      apartment: 'شقة',
      villa: 'فيلا',
      office: 'مكتب',
      land: 'أرض',
      commercial: 'تجاري'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإضافة العقار للمفضلة",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);

        if (error) throw error;
        setIsLiked(false);
        toast({
          title: "تم الحذف",
          description: "تم حذف العقار من المفضلة"
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: property.id
          });

        if (error) throw error;
        setIsLiked(true);
        toast({
          title: "تم الإضافة للمفضلة",
          description: "تم إضافة العنصر إلى قائمة المفضلات"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط العقار"
      });
    }
  };

  const handleContact = () => {
    const message = `مرحباً، أريد الاستفسار عن ${property.title} - ${formatPrice(property.price)}`;
    const whatsappUrl = `https://wa.me/${property.agent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClick = () => {
    navigate(`/product/${property.id}`);
  };

  return (
    <div className="group cursor-pointer bg-gradient-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 border border-border/30 hover:border-primary/30">
      {/* صورة العقار */}
      <div 
        className="relative overflow-hidden cursor-pointer"
        onClick={() => navigate(`/product/${property.id}`)}
      >
        <div 
          className="w-full h-48 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
          style={{ backgroundImage: `url(${property.images[0] || '/placeholder.svg'})` }}
        >
          {/* طبقة التحسين */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* شارات الحالة */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <Badge 
              variant={property.listing_type === 'rent' ? 'secondary' : 'default'}
              className="bg-primary/90 text-primary-foreground backdrop-blur-sm font-arabic"
            >
              {property.listing_type === 'rent' ? 'للإيجار' : 'للبيع'}
            </Badge>
            <Badge 
              variant="outline"
              className="bg-background/90 backdrop-blur-sm font-arabic"
            >
              {getPropertyTypeLabel(property.property_type)}
            </Badge>
          </div>

          {/* أزرار التفاعل */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* عداد المشاهدات */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 rtl:space-x-reverse bg-black/50 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
            <Eye className="w-3 h-3" />
            <span className="font-arabic">١٢٠</span>
          </div>
        </div>
      </div>

      {/* معلومات العقار */}
      <div className="p-4 cursor-pointer" onClick={handleClick}>
        {/* العنوان والسعر */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 font-arabic text-right line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {property.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary font-arabic">
              {formatPrice(property.price)}
            </p>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 ml-1" />
              <span className="font-arabic">{property.neighborhood}, {property.city}</span>
            </div>
          </div>
        </div>

        {/* تفاصيل العقار */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 font-arabic">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Home className="w-4 h-4" />
            <span>{property.area_sqm} م²</span>
          </div>
          {property.bedrooms && property.bathrooms && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            </div>
          )}
        </div>

        {/* المرافق */}
        {property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* زر التواصل */}
        <Button 
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 font-arabic"
          onClick={(e) => {
            e.stopPropagation();
            handleContact();
          }}
        >
          <MessageCircle className="w-4 h-4 ml-2" />
          تواصل واتساب
        </Button>
      </div>

      {/* تأثير الحواف المتوهجة */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/0 group-hover:ring-primary/30 transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default PropertyCard;