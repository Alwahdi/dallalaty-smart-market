import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Eye, ImagePlus, Building2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MediaUpload from '@/components/MediaUpload';

interface Property {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  description?: string;
  images?: string[];
  videos?: string[];
  amenities?: string[];
  status: string;
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  title: string;
  slug: string;
}

export default function PropertyManagement() {
  const { user } = useAuth();
  const { isAdmin, isPropertiesAdmin } = useRoles();
  const { toast } = useToast();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Property form
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    price: '',
    property_type: '',
    listing_type: 'للبيع',
    location: '',
    city: '',
    neighborhood: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    description: '',
    agent_name: '',
    agent_phone: '',
    agent_email: '',
    category: '',
    status: 'active'
  });
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [propertyVideos, setPropertyVideos] = useState<string[]>([]);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
    fetchCategories();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل العقارات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, title, slug')
        .eq('status', 'active');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const saveProperty = async () => {
    try {
      if (!propertyForm.title || !propertyForm.price || !propertyForm.location) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive"
        });
        return;
      }

      const propertyData = {
        title: propertyForm.title,
        price: parseFloat(propertyForm.price),
        property_type: propertyForm.property_type,
        listing_type: propertyForm.listing_type,
        location: propertyForm.location,
        city: propertyForm.city,
        neighborhood: propertyForm.neighborhood || null,
        bedrooms: propertyForm.bedrooms ? parseInt(propertyForm.bedrooms) : null,
        bathrooms: propertyForm.bathrooms ? parseInt(propertyForm.bathrooms) : null,
        area_sqm: propertyForm.area_sqm ? parseFloat(propertyForm.area_sqm) : null,
        description: propertyForm.description || null,
        agent_name: propertyForm.agent_name || null,
        agent_phone: propertyForm.agent_phone || null,
        agent_email: propertyForm.agent_email || null,
        category: propertyForm.category || null,
        status: propertyForm.status,
        agent_id: user?.id || null,
        images: propertyImages,
        videos: propertyVideos
      };

      let error;
      if (editingProperty) {
        const result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('properties')
          .insert([propertyData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: editingProperty ? "تم تحديث العقار بنجاح" : "تم إضافة العقار بنجاح"
      });

      resetForm();
      setPropertyDialogOpen(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ العقار",
        variant: "destructive"
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف العقار بنجاح"
      });

      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف العقار",
        variant: "destructive"
      });
    }
  };

  const updatePropertyStatus = async (propertyId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة العقار بنجاح"
      });

      fetchProperties();
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث حالة العقار",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setPropertyForm({
      title: '',
      price: '',
      property_type: '',
      listing_type: 'للبيع',
      location: '',
      city: '',
      neighborhood: '',
      bedrooms: '',
      bathrooms: '',
      area_sqm: '',
      description: '',
      agent_name: '',
      agent_phone: '',
      agent_email: '',
      category: '',
      status: 'active'
    });
    setPropertyImages([]);
    setPropertyVideos([]);
    setEditingProperty(null);
  };

  const editProperty = (property: Property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title,
      price: property.price.toString(),
      property_type: property.property_type,
      listing_type: property.listing_type,
      location: property.location,
      city: property.city,
      neighborhood: property.neighborhood || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      area_sqm: property.area_sqm?.toString() || '',
      description: property.description || '',
      agent_name: property.agent_name || '',
      agent_phone: property.agent_phone || '',
      agent_email: property.agent_email || '',
      category: property.category || '',
      status: property.status
    });
    setPropertyImages(property.images || []);
    setPropertyVideos(property.videos || []);
    setPropertyDialogOpen(true);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // Check permissions
  if (!isAdmin && !isPropertiesAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">ليس لديك صلاحية للوصول لهذه الصفحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-md" />
            إدارة العقارات
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">إدارة جميع العقارات والإعلانات في النظام</p>
        </div>
        
        <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2 w-full sm:w-auto touch-manipulation h-11 sm:h-10 text-base sm:text-sm font-semibold shadow-sm">
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>إضافة عقار جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] p-0 gap-0">
            <DialogHeader className="p-4 sm:p-6 pb-3 border-b sticky top-0 bg-background z-10">
              <DialogTitle className="text-lg sm:text-xl">{editingProperty ? 'تحديث العقار' : 'إضافة عقار جديد'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto p-4 sm:p-6 pt-4">
              <div>
                <Label htmlFor="title" className="text-sm sm:text-base">عنوان العقار *</Label>
                <Input
                  id="title"
                  value={propertyForm.title}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="شقة للبيع في..."
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-sm sm:text-base">السعر *</Label>
                <Input
                  id="price"
                  type="number"
                  value={propertyForm.price}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="000000"
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="property_type" className="text-sm sm:text-base">نوع العقار</Label>
                <Select 
                  value={propertyForm.property_type} 
                  onValueChange={(value) => setPropertyForm(prev => ({ ...prev, property_type: value }))}
                >
                  <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm mt-1.5">
                    <SelectValue placeholder="اختر نوع العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="شقة">شقة</SelectItem>
                    <SelectItem value="فيلا">فيلا</SelectItem>
                    <SelectItem value="بيت">بيت</SelectItem>
                    <SelectItem value="أرض">أرض</SelectItem>
                    <SelectItem value="مكتب">مكتب</SelectItem>
                    <SelectItem value="محل">محل تجاري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="listing_type" className="text-sm sm:text-base">نوع العرض</Label>
                <Select 
                  value={propertyForm.listing_type} 
                  onValueChange={(value) => setPropertyForm(prev => ({ ...prev, listing_type: value }))}
                >
                  <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm mt-1.5">
                    <SelectValue placeholder="اختر نوع العرض" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="للبيع">للبيع</SelectItem>
                    <SelectItem value="للإيجار">للإيجار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location" className="text-sm sm:text-base">الموقع *</Label>
                <Input
                  id="location"
                  value={propertyForm.location}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="العنوان التفصيلي"
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-sm sm:text-base">المدينة</Label>
                <Input
                  id="city"
                  value={propertyForm.city}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="الرياض، جدة، الدمام..."
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="bedrooms" className="text-sm sm:text-base">عدد غرف النوم</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={propertyForm.bedrooms}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, bedrooms: e.target.value }))}
                  placeholder="3"
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms" className="text-sm sm:text-base">عدد دورات المياه</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={propertyForm.bathrooms}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, bathrooms: e.target.value }))}
                  placeholder="2"
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="area" className="text-sm sm:text-base">المساحة (متر مربع)</Label>
                <Input
                  id="area"
                  type="number"
                  value={propertyForm.area_sqm}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, area_sqm: e.target.value }))}
                  placeholder="120"
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm sm:text-base">القسم</Label>
                <Select 
                  value={propertyForm.category} 
                  onValueChange={(value) => setPropertyForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm mt-1.5">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-sm sm:text-base">الوصف</Label>
                <Textarea
                  id="description"
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مفصل للعقار..."
                  rows={4}
                  className="text-base sm:text-sm mt-1.5 resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="flex items-center gap-2 text-sm sm:text-base mb-2">
                  <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  الوسائط (صور وفيديو)
                </Label>
                <div className="mt-2">
                  <MediaUpload
                    images={propertyImages}
                    videos={propertyVideos}
                    onImagesChange={setPropertyImages}
                    onVideosChange={setPropertyVideos}
                    maxImages={10}
                    maxVideos={2}
                    bucketName="properties"
                    folder="property-images"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="agent_name" className="text-sm sm:text-base">اسم الوكيل</Label>
                <Input
                  id="agent_name"
                  value={propertyForm.agent_name}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, agent_name: e.target.value }))}
                  placeholder="أحمد محمد"
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="agent_phone" className="text-sm sm:text-base">هاتف الوكيل</Label>
                <Input
                  id="agent_phone"
                  value={propertyForm.agent_phone}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, agent_phone: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="h-11 sm:h-10 text-base sm:text-sm mt-1.5"
                />
              </div>
              <div className="md:col-span-2 sticky bottom-0 bg-background pt-4 pb-2 border-t mt-2">
                <Button onClick={saveProperty} className="w-full h-12 sm:h-10 text-base sm:text-sm font-semibold shadow-md">
                  {editingProperty ? 'تحديث العقار' : 'إضافة العقار'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="البحث في العقارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="sold">مباع</SelectItem>
                  <SelectItem value="rented">مؤجر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium max-w-48 truncate">
                      {property.title}
                    </TableCell>
                    <TableCell>
                      {property.price.toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell>{property.property_type}</TableCell>
                    <TableCell className="max-w-32 truncate">{property.location}</TableCell>
                    <TableCell>
                      <Select 
                        value={property.status} 
                        onValueChange={(value) => updatePropertyStatus(property.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant={
                              property.status === 'active' ? 'default' : 
                              property.status === 'sold' ? 'destructive' : 
                              property.status === 'rented' ? 'secondary' : 'outline'
                            }>
                              {property.status === 'active' && 'نشط'}
                              {property.status === 'inactive' && 'غير نشط'}
                              {property.status === 'sold' && 'مباع'}
                              {property.status === 'rented' && 'مؤجر'}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="sold">مباع</SelectItem>
                          <SelectItem value="rented">مؤجر</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(property.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="touch-manipulation"
                          onClick={() => editProperty(property)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="touch-manipulation">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف العقار</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProperty(property.id)}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-3">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header with image preview */}
                    <div className="flex gap-3">
                      {property.images && property.images.length > 0 && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-1.5">{property.title}</h3>
                        <p className="text-xl font-bold text-primary">
                          {property.price.toLocaleString('ar-SA')} ريال
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">الحالة:</span>
                      <Select 
                        value={property.status} 
                        onValueChange={(value) => updatePropertyStatus(property.id, value)}
                      >
                        <SelectTrigger className="w-28 h-9 text-sm">
                          <SelectValue>
                            <Badge variant={
                              property.status === 'active' ? 'default' : 
                              property.status === 'sold' ? 'destructive' : 
                              property.status === 'rented' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {property.status === 'active' && 'نشط'}
                              {property.status === 'inactive' && 'غير نشط'}
                              {property.status === 'sold' && 'مباع'}
                              {property.status === 'rented' && 'مؤجر'}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="sold">مباع</SelectItem>
                          <SelectItem value="rented">مؤجر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Property Details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-xs">النوع:</span>
                        <span className="font-medium">{property.property_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-xs">المدينة:</span>
                        <span className="font-medium truncate">{property.city}</span>
                      </div>
                      {property.bedrooms && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-xs">غرف النوم:</span>
                          <span className="font-medium">{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-xs">الحمامات:</span>
                          <span className="font-medium">{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area_sqm && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <span className="text-muted-foreground text-xs">المساحة:</span>
                          <span className="font-medium">{property.area_sqm} م²</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        {new Date(property.created_at).toLocaleDateString('ar-SA')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-4 touch-manipulation font-medium"
                          onClick={() => editProperty(property)}
                        >
                          <Edit className="w-4 h-4 ml-1.5" />
                          <span>تعديل</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-10 w-10 p-0 touch-manipulation">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg">حذف العقار</AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                هل أنت متأكد من حذف "{property.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="h-11 sm:h-10 w-full sm:w-auto">إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteProperty(property.id)}
                                className="h-11 sm:h-10 w-full sm:w-auto"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-12 px-4">
              <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg sm:text-xl mb-2">لا توجد عقارات</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                {searchTerm ? 'لم يتم العثور على عقارات تطابق البحث' : 'لا توجد عقارات في النظام'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setPropertyDialogOpen(true)}
                  className="h-11 sm:h-10 px-6 font-semibold"
                >
                  إضافة عقار جديد
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}