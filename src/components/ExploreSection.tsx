import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DbCategory {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  icon: string | null;
  status: string;
  order_index: number;
}

const ExploreSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories from database
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('status', 'active')
          .is('parent_id', null)
          .order('order_index', { ascending: true });

        if (categoriesError) throw categoriesError;

        setCategories(categoriesData || []);

        // Fetch counts for each category
        if (categoriesData && categoriesData.length > 0) {
          const countsPromises = categoriesData.map(async (cat) => {
            const { count } = await supabase
              .from('properties')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'active')
              .eq('category', cat.slug);
            
            return [cat.id, count || 0] as const;
          });

          const countsResults = await Promise.all(countsPromises);
          const countsMap: Record<string, number> = {};
          countsResults.forEach(([id, count]) => {
            countsMap[id] = count;
          });
          setCounts(countsMap);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Icons.Package;
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Package;
  };

  const handleCategoryClick = (category: DbCategory) => {
    navigate(`/properties?category=${category.slug}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 sm:h-40 md:h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 px-3 sm:px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-30 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 font-arabic">
            استكشف جميع الأقسام
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-arabic px-4">
            اختر القسم المناسب لك واستكشف أفضل العروض المتاحة
          </p>
        </div>

        {/* Categories Grid - 3 columns on mobile, 6 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          {categories.map((category, index) => {
            const IconComponent = getIconComponent(category.icon);
            const count = counts[category.id] || 0;
            const isHovered = hoveredCard === category.id;
            
            return (
              <div 
                key={category.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card 
                  className={`group cursor-pointer transition-all duration-500 hover:shadow-elegant border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden h-full
                    ${isHovered ? 'scale-105 shadow-glow ring-2 ring-primary/30' : 'hover:scale-105'}
                  `}
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6 flex flex-col items-center text-center h-full relative">
                    {/* Animated background gradient on hover */}
                    <div className={`absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    {/* Icon */}
                    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-primary mb-2 sm:mb-3 md:mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10
                      ${isHovered ? 'shadow-glow animate-pulse' : 'shadow-card'}
                    `}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary-foreground" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-bold text-foreground text-xs sm:text-sm md:text-base font-arabic group-hover:text-primary transition-colors duration-300 mb-1 sm:mb-2 line-clamp-2 relative z-10">
                      {category.title}
                    </h3>
                    
                    {/* Subtitle - hidden on mobile for space */}
                    {category.subtitle && (
                      <p className="hidden sm:block text-xs text-muted-foreground font-arabic mb-2 sm:mb-3 line-clamp-1 relative z-10">
                        {category.subtitle}
                      </p>
                    )}
                    
                    {/* Count Badge */}
                    <div className="mt-auto relative z-10">
                      <div className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:border-primary
                        ${isHovered ? 'scale-110' : ''}
                      `}>
                        <span className={`text-xs sm:text-sm font-bold font-arabic transition-colors duration-300
                          ${isHovered ? 'text-primary-foreground' : 'text-primary'}
                        `}>
                          {count}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-arabic mt-1">
                        عرض متاح
                      </p>
                    </div>

                    {/* Hover indicator arrow */}
                    <div className={`absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0`}>
                      <Icons.ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center animate-fade-in">
          <Button 
            onClick={() => navigate('/properties')} 
            size="lg"
            className="bg-gradient-primary text-primary-foreground px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg hover:shadow-glow transition-all duration-500 font-arabic group hover:scale-105 active:scale-95"
          >
            <span>عرض جميع الأقسام</span>
            <Icons.ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
          </Button>
        </div>

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-12 animate-fade-in">
            <Icons.PackageOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 font-arabic">
              لا توجد أقسام متاحة حالياً
            </h3>
            <p className="text-muted-foreground font-arabic text-sm sm:text-base">
              سنضيف المزيد من الأقسام قريباً
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreSection;