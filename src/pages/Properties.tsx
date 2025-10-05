import { useState, useEffect, useMemo } from 'react';
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
import debounce from 'lodash.debounce';

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
  const { isDark, toggleTheme } = useTheme();
  const { searchFilters, saveSearchFilters } = useSearchCache();
  const { preferences } = useUserPreferences();
  useRouteTracking();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: searchFilters.category || 'all',
    city: searchFilters.city || 'all',
    type: 'all',
    listingType: searchFilters.listingType || 'all',
    minPrice: searchFilters.minPrice || '',
    maxPrice: searchFilters.maxPrice || '',
  });

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Debounced search to avoid too many re-renders
  const debouncedUpdateSearch = useMemo(
    () => debounce((value: string) => updateFilter('searchTerm', value), 300),
    []
  );

  // Save filters automatically
  useEffect(() => {
    if (preferences.autoSaveSearch) saveSearchFilters(filters);
  }, [filters, preferences.autoSaveSearch, saveSearchFilters]);

  // Initialize from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const locationParam = searchParams.get('location');
    const categoryParam = searchParams.get('category');

    if (searchParam) updateFilter('searchTerm', searchParam);
    if (categoryParam) {
      const categoryMap: Record<string, string> = {
        'شقق للبيع': 'real-estate',
        'شقق للإيجار': 'real-estate',
        'أراضي': 'real-estate',
        'سيارات': 'cars',
        'أثاث': 'furniture'
      };
      updateFilter('category', categoryMap[categoryParam] || categoryParam);
    }

    fetchProperties();
  }, [searchParams]);

  // Fetch properties from Supabase
  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: 'خطأ في جلب العروض',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter helpers
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const { searchTerm, category, city, type, listingType, minPrice, maxPrice } = filters;

      const matchesSearch = !searchTerm || [
        property.title,
        property.description,
        property.location,
        property.neighborhood,
        property.brand,
        property.model
      ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = category === 'all' || property.category === category;
      const matchesCity = city === 'all' || property.city === city;
      const matchesType = type === 'all' || property.property_type === type;
      const matchesListingType = listingType === 'all' || property.listing_type === listingType;
      const matchesPrice =
        (!minPrice || property.price >= parseInt(minPrice)) &&
        (!maxPrice || property.price <= parseInt(maxPrice));

      return matchesSearch && matchesCategory && matchesCity && matchesType && matchesListingType && matchesPrice;
    });
  }, [properties, filters]);

  // Extract unique values for filters
  const categories = useMemo(() => [...new Set(properties.map(p => p.category))], [properties]);
  const cities = useMemo(() => [...new Set(properties.map(p => p.city))], [properties]);
  const propertyTypes = useMemo(() => [...new Set(properties.map(p => p.property_type))], [properties]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
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
    const icons: Record<string, any> = {
      'real-estate': Home,
      'cars': Car,
      'furniture': Sofa,
      'electronics': Smartphone,
    };
    return icons[category] || Home;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apartment: 'شقة', villa: 'فيلا', house: 'منزل', land: 'أرض', commercial: 'تجاري',
      sedan: 'سيدان', suv: 'دفع رباعي', hatchback: 'هاتشباك', coupe: 'كوبيه', truck: 'شاحنة',
      sofa: 'أريكة', bed: 'سرير', table: 'طاولة', chair: 'كرسي', wardrobe: 'خزانة',
      smartphone: 'هاتف ذكي', laptop: 'لابتوب', tv: 'تلفاز', tablet: 'تابلت', camera: 'كاميرا'
    };
    return labels[type] || type;
  };

  const clearFilters = () => setFilters({
    searchTerm: '',
    category: 'all',
    city: 'all',
    type: 'all',
    listingType: 'all',
    minPrice: '',
    maxPrice: '',
  });

  if (loading) {
    return (
      <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} className="hidden md:block" />
        <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} className="block md:hidden" />
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <h1 className="text-3xl font-bold mb-6">جميع العروض</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      <HeaderNew isDark={isDark} toggleTheme={toggleTheme} className="hidden md:block" />
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} className="block md:hidden" />

      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">جميع العروض</h1>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={filters.category === 'all' ? 'default' : 'outline'} onClick={() => updateFilter('category', 'all')} className="font-arabic">
            جميع الفئات
          </Button>
          {categories.map(cat => {
            const Icon = getCategoryIcon(cat);
            return (
              <Button key={cat} variant={filters.category === cat ? 'default' : 'outline'} onClick={() => updateFilter('category', cat)} className="font-arabic flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {getCategoryLabel(cat)}
              </Button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="relative col-span-full lg:col-span-2">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="ابحث عن العرض المطلوب..." defaultValue={filters.searchTerm} onChange={e => debouncedUpdateSearch(e.target.value)} className="pr-10 font-arabic" dir="rtl" />
            </div>

            {/* City Filter */}
            <Select value={filters.city} onValueChange={value => updateFilter('city', value)}>
              <SelectTrigger className="font-arabic"><SelectValue placeholder="المدينة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={filters.type} onValueChange={value => updateFilter('type', value)}>
              <SelectTrigger className="font-arabic"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {propertyTypes.map(type => <SelectItem key={type} value={type}>{getPropertyTypeLabel(type)}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Listing Type Filter */}
            <Select value={filters.listingType} onValueChange={value => updateFilter('listingType', value)}>
              <SelectTrigger className="font-arabic"><SelectValue placeholder="نوع الإعلان" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="for_sale">للبيع</SelectItem>
                <SelectItem value="for_rent">للإيجار</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="w-full font-arabic">
              <Filter className="h-4 w-4 ml-2" />
              مسح الفلاتر
            </Button>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input type="number" placeholder="أقل سعر" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="pl-10 font-arabic" dir="ltr" />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input type="number" placeholder="أعلى سعر" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="pl-10 font-arabic" dir="ltr" />
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="text-muted-foreground mb-6 font-arabic">تم العثور على {filteredProperties.length} عرض</p>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4 font-arabic">لا توجد عروض</h3>
            <Button onClick={clearFilters} className="font-arabic">مسح الفلاتر</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
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
