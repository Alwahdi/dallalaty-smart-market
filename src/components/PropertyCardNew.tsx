import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from '@/hooks/useFavorites';
import { toYemenDialDigits, isRentListing } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/currency';
import ImagePreview from '@/components/ImagePreview';

interface Property {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  currency?: string | null;
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
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(property.id);
  const [busy, setBusy] = useState(false);
  const dial = toYemenDialDigits(property.agent_phone);
  const isRent = isRentListing(property.listing_type);

  const handleLike = async () => {
    if (busy) return;
    setBusy(true);
    await toggleFavorite(property.id);
    setBusy(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${property.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: property.title, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'تم نسخ الرابط' });
    }
  };

  const whatsappHref = dial
    ? `https://wa.me/${dial}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن ${property.title} - ${formatPrice(property.price, property.currency)}`)}`
    : null;

  const locationLabel = [property.neighborhood, property.city].filter(Boolean).join('، ');

  return (
    <article className="group relative bg-gradient-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-shadow duration-300 border border-border/30 hover:border-primary/30 focus-within:ring-2 focus-within:ring-ring">
      <div className="relative h-48 overflow-hidden z-10">
        <ImagePreview images={property.images || []} alt={property.title} className="h-48" />
        {property.listing_type && (
          <Badge variant={isRent ? 'secondary' : 'default'} className="absolute top-3 start-3 font-arabic pointer-events-none">
            {isRent ? 'للإيجار' : 'للبيع'}
          </Badge>
        )}
        <div className="absolute top-2 end-2 flex flex-col gap-2 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <Button size="icon" variant="secondary" className="bg-background/90 backdrop-blur-sm hover:bg-background rounded-full"
            onClick={handleLike} disabled={busy} aria-pressed={liked} aria-label={liked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
            <Heart className={`w-5 h-5 ${liked ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
          <Button size="icon" variant="secondary" className="bg-background/90 backdrop-blur-sm hover:bg-background rounded-full"
            onClick={handleShare} aria-label="مشاركة">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1 font-arabic text-right line-clamp-2">
          <Link to={`/product/${property.id}`} className="after:absolute after:inset-0 focus-visible:outline-none group-hover:text-primary-text transition-colors">
            {property.title}
          </Link>
        </h3>
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-2xl font-bold text-primary-text font-arabic">{formatPrice(property.price, property.currency)}</p>
          {locationLabel && (
            <div className="flex items-center text-muted-foreground text-sm min-w-0">
              <MapPin className="w-4 h-4 me-1 shrink-0" />
              <span className="font-arabic truncate">{locationLabel}</span>
            </div>
          )}
        </div>
        {whatsappHref ? (
          <Button asChild className="relative z-10 w-full font-arabic">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 me-2" />تواصل واتساب
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">التفاصيل داخل صفحة العنصر</p>
        )}
      </div>
    </article>
  );
};

export default PropertyCard;
