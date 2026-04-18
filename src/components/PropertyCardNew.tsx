import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, MessageCircle, Share2, Eye } from "lucide-react";
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
  location?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  images: string[];
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
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإضافة العنصر للمفضلة",
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
        toast({ title: "تم الحذف", description: "تم حذف العنصر من المفضلة" });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: property.id });
        if (error) throw error;
        setIsLiked(true);
        toast({ title: "تمت الإضافة", description: "تمت إضافة العنصر إلى المفضلة" });
      }
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/product/${property.id}`;
    if (navigator.share) {
      navigator.share({ title: property.title, text: property.description || '', url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "تم النسخ", description: "تم نسخ رابط العنصر" });
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property.agent_phone) {
      toast({ title: "غير متاح", description: "رقم البائع غير متوفر", variant: "destructive" });
      return;
    }
    const message = `مرحباً، أريد الاستفسار عن ${property.title} - ${formatPrice(property.price)}`;
    const whatsappUrl = `https://wa.me/${property.agent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClick = () => {
    navigate(`/product/${property.id}`);
  };

  const locationLabel = [property.neighborhood, property.city].filter(Boolean).join('، ');

  return (
    <div
      className="group cursor-pointer bg-gradient-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 border border-border/30 hover:border-primary/30"
      onClick={handleClick}
    >
      {/* صورة العنصر */}
      <div className="relative overflow-hidden">
        <div
          className="w-full h-48 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
          style={{ backgroundImage: `url(${property.images?.[0] || '/placeholder.svg'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {property.listing_type && (
            <div className="absolute top-3 right-3">
              <Badge
                variant={property.listing_type === 'rent' ? 'secondary' : 'default'}
                className="bg-primary/90 text-primary-foreground backdrop-blur-sm font-arabic"
              >
                {property.listing_type === 'rent' ? 'للإيجار' : 'للبيع'}
              </Badge>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleLike}
              aria-label="إضافة للمفضلة"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleShare}
              aria-label="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* معلومات العنصر */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1 font-arabic text-right line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {property.title}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <p className="text-2xl font-bold text-primary font-arabic">
            {formatPrice(property.price)}
          </p>
          {locationLabel && (
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 ml-1" />
              <span className="font-arabic">{locationLabel}</span>
            </div>
          )}
        </div>

        <Button
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 font-arabic"
          onClick={handleContact}
        >
          <MessageCircle className="w-4 h-4 ml-2" />
          تواصل واتساب
        </Button>
      </div>
    </div>
  );
};

export default PropertyCard;
