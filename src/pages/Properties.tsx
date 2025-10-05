import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCardNew';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, DollarSign, Car, Home, Smartphone, Sofa } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import { useTheme } from '@/hooks/useTheme';
import { useSearchCache, useUserPreferences } from '@/hooks/useLocalStorage';
import { useRouteTracking } from '@/hooks/useRouteTracking';

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

export default function Properties() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Cache hooks
  const { isDark, toggleTheme } = useTheme();
  const { searchFilters, saveSearchFilters, addRecentSearch } = useSearchCache();
  const { preferences } = useUserPreferences();
  useRouteTracking();
  
  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchFilters.category || 'all');
  const [selectedCity, setSelectedCity] = useState(searchFilters.city || 'all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedListingType, setSelectedListingType] = useState(searchFilters.listingType || 'all');
  const [minPrice, setMinPrice] = useState(searchFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchFilters.maxPrice || '');

  // Save search filters when they change
  useEffect(() => {
    if (preferences.autoSaveSearch) {
      saveSearchFilters({
        category: selectedCategory,
        city: selectedCity,
        listingType: selectedListingType,
        minPrice,
        maxPrice
      });
    }
  }, [selectedCategory, selectedCity, selectedListingType, minPrice, maxPrice, preferences.autoSaveSearch, saveSearchFilters]);

  useEffect(() => {
    // Initialize from URL params
    const searchParam = searchParams.get('search');
    const locationParam = searchParams.get('location');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) {
      // Map category filters to database categories
      const categoryMap: { [key: string]: string } = {
        'شقق للبيع': 'real-estate',
        'شقق للإيجار': 'real-estate',
        'أراضي': 'real-estate',
        'سيارات': 'cars',
        'أثاث': 'furniture'
      };
      setSelectedCategory(categoryMap[categoryParam] || categoryParam);
    }
    
    fetchProperties();
  }, [searchParams]);

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
    // Search term filter
    let matchesSearch = true;
    if (searchTerm) {
      matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     property.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     property.model?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // URL location parameter filter
    const locationParam = searchParams.get('location');
    let matchesLocation = true;
    if (locationParam) {
      matchesLocation = property.location.toLowerCase().includes(locationParam.toLowerCase()) ||
                       property.city.toLowerCase().includes(locationParam.toLowerCase()) ||
                       property.neighborhood?.toLowerCase().includes(locationParam.toLowerCase());
    }
    
    const matchesCategory = selectedCategory === 'all' || property.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || property.city === selectedCity;
    const matchesType = selectedType === 'all' || property.property_type === selectedType;
    const matchesListingType = selectedListingType === 'all' || property.listing_type === selectedListingType;
    
    const matchesPrice = (!minPrice || property.price >= parseInt(minPrice)) &&
                        (!maxPrice || property.price <= parseInt(maxPrice));

    return matchesSearch && matchesLocation && matchesCategory && matchesCity && matchesType && matchesListingType && matchesPrice;
  });

  // Extract unique values for filters
  const categories = [...new Set(properties.map(p => p.category))];
  const cities = [...new Set(properties.map(p => p.city))];
  const propertyTypes = [...new Set(properties.map(p => p.property_type))];

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'real-estate': 'عقارات',
      'cars': 'سيارات',
      'furniture': 'أثاث',
      'electronics': 'إلكترونيات',
      'clothes': 'ملابس',
      'books': 'كتب',
      'sports': 'رياضة',
      'other': 'أخرى'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'real-estate': Home,
      'cars': Car,
      'furniture': Sofa,
      'electronics': Smartphone,
    };
    return icons[category] || Home;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      // Real Estate
      'apartment': 'شقة',
      'villa': 'فيلا',
      'house': 'منزل',
      'land': 'أرض',
      'commercial': 'تجاري',
      // Cars
      'sedan': 'سيدان',
      'suv': 'دفع رباعي',
      'hatchback': 'هاتشباك',
      'coupe': 'كوبيه',
      'truck': 'شاحنة',
      // Furniture
      'sofa': 'أريكة',
      'bed': 'سرير',
      'table': 'طاولة',
      'chair': 'كرسي',
      'wardrobe': 'خزانة',
      // Electronics
      'smartphone': 'هاتف ذكي',
      'laptop': 'لابتوب',
      'tv': 'تلفاز',
      'tablet': 'تابلت',
      'camera': 'كاميرا'
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
        {/* Desktop Header */}
        <div className="hidden md:block">
          <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
        </div>
        
        {/* Mobile Header */}
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
      {/* Desktop Header */}
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      
      {/* Mobile Header */}
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} />
      
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 font-arabic">جميع العروض</h1>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="font-arabic"
            >
              جميع الفئات
            </Button>
            {categories.map(category => {
              const Icon = getCategoryIcon(category);
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="font-arabic flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {getCategoryLabel(category)}
                </Button>
              );
            })}
          </div>
          
          {/* Search and Filters */}
          <div className="bg-card rounded-lg p-6 shadow-sm border mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative col-span-full lg:col-span-2">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ابحث عن العرض المطلوب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 font-arabic"
                  dir="rtl"
                />
              </div>

              {/* City Filter */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="font-arabic">
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
                <SelectTrigger className="font-arabic">
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
                <SelectTrigger className="font-arabic">
                  <SelectValue placeholder="نوع الإعلان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="for_sale">للبيع</SelectItem>
                  <SelectItem value="for_rent">للإيجار</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters} className="w-full font-arabic">
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="number"
                  placeholder="أقل سعر"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="pl-10 font-arabic"
                  dir="ltr"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="number"
                  placeholder="أعلى سعر"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="pl-10 font-arabic"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground font-arabic">
              تم العثور على {filteredProperties.length} عرض
            </p>
            {selectedCategory !== 'all' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-arabic">
                <span>الفئة:</span>
                <span className="font-semibold">{getCategoryLabel(selectedCategory)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4 font-arabic">لا توجد عروض</h3>
            <p className="text-muted-foreground font-arabic mb-6 max-w-md mx-auto">
              لم يتم العثور على عروض تطابق معايير البحث الخاصة بك. جرب تعديل الفلاتر أو البحث عن شيء آخر.
            </p>
            <Button onClick={clearFilters} className="font-arabic">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div 
                key={property.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}