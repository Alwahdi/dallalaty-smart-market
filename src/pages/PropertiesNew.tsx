import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCardNew';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import { useTheme } from '@/hooks/useTheme';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  location: string;
  city: string;
  neighborhood: string;
  images: string[];
  amenities: string[];
  listing_type: string;
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  size?: string;
  color?: string;
  material?: string;
}

interface Category {
  id: string;
  title: string;
  slug: string;
  icon: string;
  description: string;
  subtitle?: string;
}

export default function Properties() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  
  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedListingType, setSelectedListingType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProperties();
    
    // Initialize from URL params
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ في جلب العروض",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || property.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || property.city === selectedCity;
    const matchesType = selectedType === 'all' || property.property_type === selectedType;
    const matchesListingType = selectedListingType === 'all' || property.listing_type === selectedListingType;
    
    const matchesPrice = (!minPrice || property.price >= parseInt(minPrice)) &&
                        (!maxPrice || property.price <= parseInt(maxPrice));

    return matchesSearch && matchesCategory && matchesCity && matchesType && matchesListingType && matchesPrice;
  });

  // Extract unique values for filters
  const cities = [...new Set(properties.map(p => p.city))];
  const propertyTypes = [...new Set(properties.map(p => p.property_type))];

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'apartment': 'شقة', 'villa': 'فيلا', 'house': 'منزل', 'land': 'أرض',
      'commercial': 'تجاري', 'sedan': 'سيدان', 'suv': 'دفع رباعي',
      'hatchback': 'هاتشباك', 'coupe': 'كوبيه', 'truck': 'شاحنة',
      'sofa': 'أريكة', 'bed': 'سرير', 'table': 'طاولة', 'chair': 'كرسي',
      'wardrobe': 'خزانة', 'smartphone': 'هاتف ذكي', 'laptop': 'لابتوب',
      'tv': 'تلفاز', 'tablet': 'تابلت', 'camera': 'كاميرا'
    };
    return labels[type] || type;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedType('all');
    setSelectedListingType('all');
    setMinPrice('');
    setMaxPrice('');
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
        <div className="hidden md:block">
          <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
        </div>
        <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} />
        
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <h1 className="text-3xl font-bold mb-6 font-arabic">جميع العروض</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} />
      
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 font-arabic">جميع العروض</h1>
        
        {/* Category Tabs - Scrollable on Mobile */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="font-arabic whitespace-nowrap min-h-[44px]"
          >
            جميع الفئات
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.slug)}
              className="font-arabic flex items-center gap-2 whitespace-nowrap min-h-[44px]"
            >
              <span className="text-lg">{category.icon}</span>
              {category.title}
            </Button>
          ))}
        </div>
        
        {/* Collapsible Search and Filters */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="bg-card rounded-lg shadow-sm border mb-6">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg font-arabic min-h-[56px]"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <span className="font-semibold">البحث والفلترة</span>
                </div>
                {isFilterOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative lg:col-span-2">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="ابحث عن العرض المطلوب..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-12 font-arabic h-12"
                      dir="rtl"
                    />
                  </div>

                  {/* City Filter */}
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="font-arabic h-12">
                      <SelectValue placeholder="المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المدن</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Type Filter */}
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="font-arabic h-12">
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {propertyTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {getPropertyTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Listing Type Filter */}
                  <Select value={selectedListingType} onValueChange={setSelectedListingType}>
                    <SelectTrigger className="font-arabic h-12">
                      <SelectValue placeholder="نوع الإعلان" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="for_sale">للبيع</SelectItem>
                      <SelectItem value="for_rent">للإيجار</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  <Button variant="outline" onClick={clearFilters} className="w-full font-arabic h-12">
                    <Filter className="h-5 w-5 ml-2" />
                    مسح الفلاتر
                  </Button>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="number"
                      placeholder="أقل سعر"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="pl-10 font-arabic h-12"
                      dir="ltr"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="number"
                      placeholder="أعلى سعر"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="pl-10 font-arabic h-12"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground font-arabic">
            تم العثور على {filteredProperties.length} عرض
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4 font-arabic">لا توجد عروض</h3>
            <p className="text-muted-foreground font-arabic mb-6 max-w-md mx-auto">
              لم يتم العثور على عروض تطابق معايير البحث الخاصة بك. جرب تعديل الفلاتر أو البحث عن شيء آخر.
            </p>
            <Button onClick={clearFilters} className="font-arabic min-h-[44px]">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div 
                key={property.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
