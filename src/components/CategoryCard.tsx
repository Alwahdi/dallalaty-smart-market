import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  count: number;
  gradient: string;
  onClick: () => void;
}

const CategoryCard = ({ title, subtitle, icon: Icon, count, gradient, onClick }: CategoryCardProps) => {
  return (
    <div 
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-elegant"
      onClick={onClick}
    >
      <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} border border-border/20 shadow-card`}>
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* المحتوى */}
        <div className="relative z-10 flex items-center space-x-4 rtl:space-x-reverse">
          {/* الأيقونة */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:animate-glow transition-all duration-300">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* النصوص */}
          <div className="flex-1 text-right">
            <h3 className="text-xl font-bold text-foreground mb-1 font-arabic group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mb-2 font-arabic">
              {subtitle}
            </p>
            <div className="flex items-center justify-end space-x-1 rtl:space-x-reverse">
              <span className="text-xs text-muted-foreground font-arabic">إعلان</span>
              <span className="text-sm font-semibold text-primary font-arabic">
                {count.toLocaleString('ar-YE')}
              </span>
            </div>
          </div>
        </div>

        {/* تأثير الإضاءة */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* الحواف المتوهجة */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default CategoryCard;