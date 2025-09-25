import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, Plus, Edit, Trash2, Search, UserPlus, Users, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Category {
  id: string;
  parent_id?: string | null;
  title: string;
  subtitle?: string | null;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CategoryRole {
  id: string;
  user_id: string;
  category_id: string;
  role: string;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
}

export default function SectionManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryRoles, setCategoryRoles] = useState<CategoryRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Category form
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    subtitle: '',
    slug: '',
    description: '',
    icon: '',
    parent_id: ''
  });
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Section manager assignment
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchCategoryRoles();
    fetchProfiles();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الأقسام",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('category_roles')
        .select('*');

      if (error) throw error;
      setCategoryRoles(data as CategoryRole[] || []);
    } catch (error) {
      console.error('Error fetching category roles:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, phone')
        .eq('is_active', true);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const saveCategory = async () => {
    try {
      if (!categoryForm.title || !categoryForm.slug) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive"
        });
        return;
      }

      const categoryData = {
        title: categoryForm.title,
        subtitle: categoryForm.subtitle || null,
        slug: categoryForm.slug,
        description: categoryForm.description || null,
        icon: categoryForm.icon || null,
        parent_id: categoryForm.parent_id || null,
        order_index: editingCategory ? editingCategory.order_index : categories.length
      };

      let error;
      if (editingCategory) {
        const result = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('categories')
          .insert([categoryData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: editingCategory ? "تم تحديث القسم بنجاح" : "تم إنشاء القسم بنجاح"
      });

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ القسم",
        variant: "destructive"
      });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      title: '',
      subtitle: '',
      slug: '',
      description: '',
      icon: '',
      parent_id: ''
    });
    setEditingCategory(null);
    setCategoryDialogOpen(false);
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف القسم بنجاح"
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف القسم",
        variant: "destructive"
      });
    }
  };

  const assignSectionManager = async () => {
    try {
      if (!selectedUser || selectedCategories.length === 0) {
        toast({
          title: "خطأ",
          description: "يرجى اختيار مستخدم وأقسام",
          variant: "destructive"
        });
        return;
      }

      // Remove existing assignments for this user for selected categories
      await supabase
        .from('category_roles')
        .delete()
        .eq('user_id', selectedUser)
        .in('category_id', selectedCategories);

      // Insert new assignments
      const assignments = selectedCategories.map(categoryId => ({
        user_id: selectedUser,
        category_id: categoryId,
        role: 'moderator' as any
      }));

      const { error } = await supabase
        .from('category_roles')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: "تم التعيين",
        description: "تم تعيين مدير الأقسام بنجاح"
      });

      setSelectedUser('');
      setSelectedCategories([]);
      setAssignmentDialogOpen(false);
      fetchCategoryRoles();
    } catch (error) {
      console.error('Error assigning section manager:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تعيين مدير الأقسام",
        variant: "destructive"
      });
    }
  };

  const getCategoryManagers = (categoryId: string) => {
    return categoryRoles
      .filter(cr => cr.category_id === categoryId)
      .map(cr => {
        const profile = profiles.find(p => p.user_id === cr.user_id);
        return { 
          id: cr.id,
          name: profile?.full_name || 'غير معروف',
          phone: profile?.phone || ''
        };
      });
  };

  const removeCategoryManager = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('category_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف مدير القسم بنجاح"
      });

      fetchCategoryRoles();
    } catch (error) {
      console.error('Error removing category manager:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف مدير القسم",
        variant: "destructive"
      });
    }
  };

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="w-6 h-6" />
            إدارة الأقسام
          </h2>
          <p className="text-muted-foreground mt-1">إدارة الأقسام وتعيين مدراء الأقسام</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" />
                تعيين مدير أقسام
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>تعيين مدير أقسام</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">المستخدم</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مستخدم..." />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.user_id}>
                          {profile.full_name} ({profile.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الأقسام المراد إدارتها</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3 mt-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories(prev => [...prev, category.id]);
                            } else {
                              setSelectedCategories(prev => prev.filter(id => id !== category.id));
                            }
                          }}
                        />
                        <Label htmlFor={category.id} className="text-sm">{category.title}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={assignSectionManager} className="w-full" disabled={!selectedUser || selectedCategories.length === 0}>
                  تعيين مدير الأقسام
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetCategoryForm()} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة قسم
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'تحديث القسم' : 'إضافة قسم جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان القسم *</Label>
                  <Input
                    id="title"
                    value={categoryForm.title}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="اسم القسم"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">الرمز المميز *</Label>
                  <Input
                    id="slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">العنوان الفرعي</Label>
                  <Input
                    id="subtitle"
                    value={categoryForm.subtitle}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="وصف مختصر"
                  />
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مفصل للقسم"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">الأيقونة</Label>
                  <Input
                    id="icon"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="اسم الأيقونة"
                  />
                </div>
                <div>
                  <Label htmlFor="parent">القسم الإب</Label>
                  <Select 
                    value={categoryForm.parent_id} 
                    onValueChange={(value) => setCategoryForm(prev => ({ ...prev, parent_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم الإب (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون قسم إب</SelectItem>
                      {categories.filter(cat => cat.id !== editingCategory?.id).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveCategory} className="w-full">
                  {editingCategory ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="البحث في الأقسام..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">الأقسام ({filteredCategories.length})</CardTitle>
          <CardDescription>جميع الأقسام المتاحة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم القسم</TableHead>
                  <TableHead className="hidden sm:table-cell">الرمز المميز</TableHead>
                  <TableHead className="hidden md:table-cell">الحالة</TableHead>
                  <TableHead>مدراء القسم</TableHead>
                  <TableHead className="hidden lg:table-cell">تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => {
                  const managers = getCategoryManagers(category.id);
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{category.title}</div>
                          {category.subtitle && (
                            <div className="text-sm text-muted-foreground">{category.subtitle}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{category.slug}</code>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={category.status === 'active' ? "default" : "secondary"}>
                          {category.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {managers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {managers.map((manager) => (
                              <Badge 
                                key={manager.id} 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeCategoryManager(manager.id)}
                                title="اضغط لحذف المدير"
                              >
                                {manager.name}
                                <X className="w-3 h-3 mr-1" />
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">لا يوجد مدراء</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(category.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryForm({
                                title: category.title,
                                subtitle: category.subtitle || '',
                                slug: category.slug,
                                description: category.description || '',
                                icon: category.icon || '',
                                parent_id: category.parent_id || ''
                              });
                              setCategoryDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف القسم</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف قسم "{category.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCategory(category.id)}>
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">لا توجد أقسام</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'لم يتم العثور على أقسام تطابق البحث' : 'لا توجد أقسام في النظام'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCategoryDialogOpen(true)}>
                  إضافة قسم جديد
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}