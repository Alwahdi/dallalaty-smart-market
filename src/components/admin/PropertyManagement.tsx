import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/use-toast';
import MediaUpload from '@/components/MediaUpload';
import { 
  Button, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Label, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { Plus, Edit, Trash2, Search, Building2, ImagePlus } from 'lucide-react';

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

  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyForm, setPropertyForm] = useState({
    title: '', price: '', property_type: '', listing_type: 'للبيع', location: '', city: '',
    neighborhood: '', bedrooms: '', bathrooms: '', area_sqm: '', description: '',
    agent_name: '', agent_phone: '', agent_email: '', category: '', status: 'active'
  });
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [propertyVideos, setPropertyVideos] = useState<string[]>([]);

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
      console.error(error);
      toast({ title: "خطأ", description: "حدث خطأ في تحميل العقارات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id,title,slug')
        .eq('status', 'active');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingProperty(null);
    setPropertyForm({
      title: '', price: '', property_type: '', listing_type: 'للبيع', location: '', city: '',
      neighborhood: '', bedrooms: '', bathrooms: '', area_sqm: '', description: '',
      agent_name: '', agent_phone: '', agent_email: '', category: '', status: 'active'
    });
    setPropertyImages([]);
    setPropertyVideos([]);
  };

  const saveProperty = async () => {
    if (!propertyForm.title || !propertyForm.price || !propertyForm.location) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const propertyData = {
      ...propertyForm,
      price: parseFloat(propertyForm.price),
      bedrooms: propertyForm.bedrooms ? parseInt(propertyForm.bedrooms) : null,
      bathrooms: propertyForm.bathrooms ? parseInt(propertyForm.bathrooms) : null,
      area_sqm: propertyForm.area_sqm ? parseFloat(propertyForm.area_sqm) : null,
      agent_id: user?.id || null,
      images: propertyImages,
      videos: propertyVideos
    };

    try {
      const { error } = editingProperty
        ? await supabase.from('properties').update(propertyData).eq('id', editingProperty.id)
        : await supabase.from('properties').insert([propertyData]);

      if (error) throw error;

      toast({ title: "تم الحفظ", description: editingProperty ? "تم تحديث العقار بنجاح" : "تم إضافة العقار بنجاح" });
      resetForm();
      setPropertyDialogOpen(false);
      fetchProperties();
    } catch (error) {
      console.error(error);
      toast({ title: "خطأ", description: "حدث خطأ في حفظ العقار", variant: "destructive" });
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "تم الحذف", description: "تم حذف العقار بنجاح" });
      fetchProperties();
    } catch (error) {
      console.error(error);
      toast({ title: "خطأ", description: "حدث خطأ في حذف العقار", variant: "destructive" });
    }
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

  const updatePropertyStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('properties').update({ status }).eq('id', id);
      if (error) throw error;
      toast({ title: "تم التحديث", description: "تم تحديث حالة العقار بنجاح" });
      fetchProperties();
    } catch (error) {
      console.error(error);
      toast({ title: "خطأ", description: "حدث خطأ في تحديث حالة العقار", variant: "destructive" });
    }
  };

  const filteredProperties = properties.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      (p.title.toLowerCase().includes(search) || p.location.toLowerCase().includes(search) || p.city.toLowerCase().includes(search)) &&
      (statusFilter === 'all' || p.status === statusFilter)
    );
  });

  if (!isAdmin && !isPropertiesAdmin) return (
    <Card><CardContent className="text-center py-8">ليس لديك صلاحية للوصول لهذه الصفحة</CardContent></Card>
  );

  if (loading) return (
    <Card><CardContent className="flex justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></CardContent></Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> إدارة العقارات
          </h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة جميع العقارات والإعلانات في النظام</p>
        </div>

        <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة عقار
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
            <DialogHeader><DialogTitle>{editingProperty ? 'تحديث العقار' : 'إضافة عقار جديد'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'title', label: 'عنوان العقار *', type: 'text', value: propertyForm.title },
                { id: 'price', label: 'السعر *', type: 'number', value: propertyForm.price },
                { id: 'property_type', label: 'نوع العقار', type: 'select', value: propertyForm.property_type, options: ['شقة','فيلا','بيت','أرض','مكتب','محل'] },
                { id: 'listing_type', label: 'نوع العرض', type: 'select', value: propertyForm.listing_type, options: ['للبيع','للإيجار'] },
                { id: 'location', label: 'الموقع *', type: 'text', value: propertyForm.location },
                { id: 'city', label: 'المدينة', type: 'text', value: propertyForm.city },
                { id: 'bedrooms', label: 'عدد غرف النوم', type: 'number', value: propertyForm.bedrooms },
                { id: 'bathrooms', label: 'عدد دورات المياه', type: 'number', value: propertyForm.bathrooms },
                { id: 'area_sqm', label: 'المساحة (متر مربع)', type: 'number', value: propertyForm.area_sqm },
                { id: 'category', label: 'القسم', type: 'select', value: propertyForm.category, options: categories.map(c => ({ label: c.title, value: c.slug })) },
                { id: 'description', label: 'الوصف', type: 'textarea', value: propertyForm.description },
                { id: 'agent_name', label: 'اسم الوكيل', type: 'text', value: propertyForm.agent_name },
                { id: 'agent_phone', label: 'هاتف الوكيل', type: 'text', value: propertyForm.agent_phone }
              ].map(field => (
                <div key={field.id} className={field.id === 'description' ? 'sm:col-span-2' : ''}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {field.type === 'text' || field.type === 'number'
                    ? <Input type={field.type} id={field.id} value={field.value} onChange={e => setPropertyForm(prev => ({ ...prev, [field.id]: e.target.value }))} />
                    : field.type === 'select'
                      ? <Select value={field.value} onValueChange={v => setPropertyForm(prev => ({ ...prev, [field.id]: v }))}>
                          <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt: any) => (
                              typeof opt === 'string' 
                                ? <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                : <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      : <Textarea id={field.id} value={field.value} onChange={e => setPropertyForm(prev => ({ ...prev, [field.id]: e.target.value }))} rows={3} />}
                </div>
              ))}

              <div className="sm:col-span-2">
                <Label className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> الوسائط (صور وفيديو)</Label>
                <MediaUpload
                  images={propertyImages} videos={propertyVideos}
                  onImagesChange={setPropertyImages} onVideosChange={setPropertyVideos}
                  maxImages={10} maxVideos={2} bucketName="properties" folder="property-images"
                />
              </div>

              <div className="sm:col-span-2">
                <Button className="w-full" onClick={saveProperty}>{editingProperty ? 'تحديث العقار' : 'إضافة العقار'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="البحث في العقارات..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pr-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="فلترة حسب الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="sold">مباع</SelectItem>
                <SelectItem value="rented">مؤجر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['العنوان','السعر','النوع','الموقع','الحالة','تاريخ الإضافة','الإجراءات'].map(h => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map(property => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium max-w-48 truncate">{property.title}</TableCell>
                    <TableCell>{property.price.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell>{property.property_type}</TableCell>
                    <TableCell className="max-w-32 truncate">{property.location}</TableCell>
                    <TableCell>
                      <Select value={property.status} onValueChange={v => updatePropertyStatus(property.id, v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant={
                              property.status === 'active' ? 'default' :
                              property.status === 'sold' ? 'destructive' :
                              property.status === 'rented' ? 'secondary' : 'outline'
                            }>
                              {{
                                active: 'نشط', inactive: 'غير نشط', sold: 'مباع', rented: 'مؤجر'
                              }[property.status]}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {['active','inactive','sold','rented'].map(v => <SelectItem key={v} value={v}>{{
                            active:'نشط',inactive:'غير نشط',sold:'مباع',rented:'مؤجر'
                          }[v]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(property.created_at).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => editProperty(property)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف العقار</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد من حذف "{property.title}"؟</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProperty(property.id)}>حذف</AlertDialogAction>
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
          <div className="md:hidden space-y-3 px-2">
            {filteredProperties.map(property => (
              <Card key={property.id}><CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{property.title}</h3>
                    <p className="text-lg font-bold text-primary mt-1">{property.price.toLocaleString('ar-SA')} ريال</p>
                  </div>
                  <Select value={property.status} onValueChange={v => updatePropertyStatus(property.id, v)}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue>
                        <Badge variant={
                          property.status === 'active' ? 'default' :
                          property.status === 'sold' ? 'destructive' :
                          property.status === 'rented' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {{
                            active: 'نشط', inactive: 'غير نشط', sold: 'مباع', rented: 'مؤجر'
                          }[property.status]}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {['active','inactive','sold','rented'].map(v => <SelectItem key={v} value={v}>{{
                        active:'نشط',inactive:'غير نشط',sold:'مباع',rented:'مؤجر'
                      }[v]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div><span className="text-muted-foreground">النوع: </span><span className="font-medium">{property.property_type}</span></div>
                  <div><span className="text-muted-foreground">الموقع: </span><span className="font-medium truncate">{property.city}</span></div>
                  {property.bedrooms && <div><span className="text-muted-foreground">الغرف: </span><span className="font-medium">{property.bedrooms}</span></div>}
                  {property.area_sqm && <div><span className="text-muted-foreground">المساحة: </span><span className="font-medium">{property.area_sqm} م²</span></div>}
                </div>
                <div className="flex justify-between items-center mt-2 border-t pt-2">
                  <span className="text-xs text-muted-foreground">{new Date(property.created_at).toLocaleDateString('ar-SA')}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => editProperty(property)}><Edit className="w-3.5 h-3.5 ml-1" />تعديل</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف العقار</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف "{property.title}"؟</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProperty(property.id)}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">لا توجد عقارات</h3>
              <p className="text-muted-foreground mb-4">{searchTerm ? 'لم يتم العثور على عقارات تطابق البحث' : 'لا توجد عقارات في النظام'}</p>
              {!searchTerm && <Button onClick={() => setPropertyDialogOpen(true)}>إضافة عقار جديد</Button>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
