import { Heart, MapPin, MessageCircle, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  area: string;
  bedrooms?: number;
  bathrooms?: number;
  type: "rent" | "sale";
  status: "new" | "used";
  images: string[];
  videos?: string[];
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
  onContact: () => void;
  onClick: () => void;
}

const PropertyCard = ({ 
  title, 
  price, 
  location, 
  area, 
  bedrooms, 
  bathrooms, 
  type, 
  status, 
  images,
  videos = [],
  isLiked, 
  onLike, 
  onShare, 
  onContact, 
  onClick 
}: PropertyCardProps) => {
  const hasMedia = images.length > 0 || videos.length > 0;
  const firstMedia = videos.length > 0 ? videos[0] : images[0];
  return (
    <div className="group cursor-pointer bg-gradient-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 border border-border/30 hover:border-primary/30">
      {/* صورة/فيديو العقار */}
      <div className="relative overflow-hidden">
        {videos.length > 0 ? (
          <div className="relative w-full h-48">
            <video
              src={videos[0]}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              muted
              playsInline
              loop
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div 
            className="w-full h-48 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
            style={{ backgroundImage: `url(${images[0]})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
          
        {/* شارات الحالة */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <Badge 
            variant={type === 'rent' ? 'secondary' : 'default'}
            className="bg-primary/90 text-primary-foreground backdrop-blur-sm font-arabic"
          >
            {type === 'rent' ? 'للإيجار' : 'للبيع'}
          </Badge>
          <Badge 
            variant="outline"
            className="bg-background/90 backdrop-blur-sm font-arabic"
          >
            {status === 'new' ? 'جديد' : 'مستعمل'}
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
              onLike();
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
              onShare();
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

      {/* معلومات العقار */}
      <div className="p-4" onClick={onClick}>
        {/* العنوان والسعر */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 font-arabic text-right line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary font-arabic">
              {price}
            </p>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 ml-1" />
              <span className="font-arabic">{location}</span>
            </div>
          </div>
        </div>

        {/* تفاصيل العقار */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 font-arabic">
          <span>{area}</span>
          {bedrooms && bathrooms && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span>{bedrooms} غرف نوم</span>
              <span>{bathrooms} حمام</span>
            </div>
          )}
        </div>

        {/* زر التواصل */}
        <Button 
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 font-arabic"
          onClick={(e) => {
            e.stopPropagation();
            onContact();
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