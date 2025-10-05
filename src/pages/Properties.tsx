import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCardNew';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, DollarSign, Car, Home, Smartphone, Sofa, X } from 'lucide-react';
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
  const { isDark, toggleTheme } = useTheme();
  const { searchFilters, saveSearchFilters, addRecentSearch } = useSearchCache();
  const { preferences } = useUserPreferences();
  useRouteTracking();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchFilters.category || 'all');
  const [selectedCity, setSelectedCity] = useState(searchFilters.city || 'all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedListingType, setSelectedListingType] = useState(searchFilters.listingType || 'all');
  const [minPrice, setMinPrice] = useState(searchFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchFilters.maxPrice || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false); // mobile filter modal

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
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) {
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
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProperties(data || []);
    } catch (error: any) {
      toast({ title: "خطأ في جلب العروض", description: error.message, variant: "destructive" });
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

    const locationParam = searchParams.get('location');
    const matchesLocation = !locationParam || 
      property.location.toLowerCase().includes(locationParam.toLowerCase()) ||
      property.city.toLowerCase().includes(locationParam.toLowerCase()) ||
      property.neighborhood?.toLowerCase().includes(locationParam.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || property.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || property.city === selectedCity;
    const matchesType = selectedType === 'all' || property.property_type === selectedType;
    const matchesListingType = selectedListingType === 'all' || property.listing_type === selectedListingType;
    const matchesPrice = (!minPrice || property.price >= parseInt(minPrice)) &&
                        (!maxPrice || property.price <= parseInt(maxPrice));

    return matchesSearch && matchesLocation && matchesCategory && matchesCity && matchesType && matchesListingType && matchesPrice;
  });

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
    const icons: { [key: string]: any } = { 'real-estate': Home, 'cars': Car, 'furniture': Sofa, 'electronics': Smartphone };
    return icons[category] || Home;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'apartment': 'شقة', 'villa': 'فيلا', 'house': 'منزل', 'land': 'أرض', 'commercial': 'تجاري',
      'sedan': 'سيدان', 'suv': 'دفع رباعي', 'hatchback': 'هاتشباك', 'coupe': 'كوبيه', 'truck': 'شاحنة',
      'sofa': 'أريكة', 'bed': 'سرير', 'table': 'طاولة', 'chair': 'كرسي', 'wardrobe': 'خزانة',
      'smartphone': 'هاتف ذكي', 'laptop': 'لابتوب', 'tv': 'تلفاز', 'tablet': 'تابلت', 'camera': 'كاميرا'
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

  if (loading) return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      <HeaderNew isDark={isDark} toggleTheme={toggleTheme} className="hidden md:block" />
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} className="md:hidden" />
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold mb-6 font-arabic">جميع العروض</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      <HeaderNew isDark={isDark} toggleTheme={toggleTheme} className="hidden md:block" />
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} className="md:hidden" />

      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold mb-6 font-arabic">جميع العروض</h1>

        {/* Search + Filter button on mobile */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ابحث عن العرض المطلوب..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pr-10 font-arabic"
              dir="rtl"
            />
          </div>

          <Button className="md:hidden w-full font-arabic flex justify-between items-center" onClick={() => setIsFilterOpen(true)}>
            <Filter className="h-4 w-4" /> الفلاتر
          </Button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} onClick={() => setSelectedCategory('all')} className="font-arabic">جميع الفئات</Button>
            {categories.map(cat => {
              const Icon = getCategoryIcon(cat);
              return (
                <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)} className="font-arabic flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {getCategoryLabel(cat)}
                </Button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="font-arabic"><SelectValue placeholder="المدينة" /></SelectTrigger>
              <SelectContent><SelectItem value="all">جميع المدن</SelectItem>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="font-arabic"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent><SelectItem value="all">جميع الأنواع</SelectItem>{propertyTypes.map(t => <SelectItem key={t} value={t}>{getPropertyTypeLabel(t)}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedListingType} onValueChange={setSelectedListingType}>
              <SelectTrigger className="font-arabic"><SelectValue placeholder="نوع الإعلان" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="for_sale">للبيع</SelectItem>
                <SelectItem value="for_rent">للإيجار</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters} className="w-full font-arabic"><Filter className="h-4 w-4 ml-2" /> مسح الفلاتر</Button>
          </div>
        </div>

        {/* Filter Modal for Mobile */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
            <div className="w-3/4 bg-background p-4 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold font-arabic">فلاتر البحث</h2>
                <Button variant="ghost" onClick={() => setIsFilterOpen(false)}><X /></Button>
              </div>

              <div className="flex flex-col gap-4">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="font-arabic"><SelectValue placeholder="المدينة" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">جميع المدن</SelectItem>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="font-arabic"><SelectValue placeholder="النوع" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">جميع الأنواع</SelectItem>{propertyTypes.map(t => <SelectItem key={t} value={t}>{getPropertyTypeLabel(t)}</SelectItem>)}</SelectContent>
                </Select>

                <Select value={selectedListingType} onValueChange={setSelectedListingType}>
                  <SelectTrigger className="font-arabic"><SelectValue placeholder="نوع الإعلان" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="for_sale">للبيع</SelectItem>
                    <SelectItem value="for_rent">للإيجار</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="أقل سعر" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <Input type="number" placeholder="أعلى سعر" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>

                <Button variant="default" onClick={() => setIsFilterOpen(false)}>تطبيق الفلاتر</Button>
                <Button variant="outline" onClick={clearFilters}>مسح الفلاتر</Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4 font-arabic">لا توجد عروض</h3>
            <p className="text-muted-foreground font-arabic mb-6 max-w-md mx-auto">
              لم يتم العثور على عروض تطابق معايير البحث الخاصة بك.
            </p>
            <Button onClick={clearFilters} className="font-arabic">مسح الفلاتر</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
