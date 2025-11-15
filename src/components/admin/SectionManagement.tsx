import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, Plus, Edit, Trash2, Search, UserPlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import CustomFieldsEditor, { CustomField } from './CustomFieldsEditor';

// Sentinel value for "no parent" option — must be a non-empty string (Radix requirement)
const NO_PARENT_VALUE = '___none___';

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
  custom_fields?: CustomField[];
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
  const [saving, setSaving] = useState(false);

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    subtitle: '',
    slug: '',
    description: '',
    icon: '',
    parent_id: NO_PARENT_VALUE, // use sentinel for no-parent
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Section manager assignment
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories((data as any[])?.map(cat => ({
        ...cat,
        custom_fields: Array.isArray(cat.custom_fields) ? cat.custom_fields : []
      })) || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast({ title: 'خطأ', description: 'حدث خطأ في تحميل الأقسام', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCategoryRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('category_roles').select('*');
      if (error) throw error;
      setCategoryRoles((data as CategoryRole[]) || []);
    } catch (err) {
      console.error('Error fetching category roles:', err);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, user_id, full_name, phone').eq('is_active', true);
      if (error) throw error;
      setProfiles((data as Profile[]) || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchCategoryRoles();
    fetchProfiles();
  }, [fetchCategories, fetchCategoryRoles, fetchProfiles]);

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({
      title: '',
      subtitle: '',
      slug: '',
      description: '',
      icon: '',
      parent_id: NO_PARENT_VALUE,
    });
    setCustomFields([]);
    setEditingCategory(null);
    setCategoryDialogOpen(false);
  }, []);

  const saveCategory = async () => {
    try {
      if (!categoryForm.title?.trim() || !categoryForm.slug?.trim()) {
        toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
        return;
      }

      setSaving(true);

      // Check for duplicate slug (when creating)
      if (!editingCategory) {
        const { data: existingCategory, error } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categoryForm.slug.toLowerCase().trim())
          .maybeSingle();

        if (error) throw error;
        if (existingCategory) {
          toast({ title: 'خطأ', description: 'الرمز المميز مستخدم بالفعل، يرجى اختيار رمز آخر', variant: 'destructive' });
          return;
        }
      }

      const categoryData = {
        title: categoryForm.title.trim(),
        subtitle: categoryForm.subtitle?.trim() || null,
        slug: categoryForm.slug.toLowerCase().trim(),
        description: categoryForm.description?.trim() || null,
        icon: categoryForm.icon?.trim() || null,
        parent_id: categoryForm.parent_id === NO_PARENT_VALUE ? null : categoryForm.parent_id,
        order_index: editingCategory ? editingCategory.order_index : categories.length,
        status: 'active',
      };

      let error;
      if (editingCategory) {
        const result = await supabase.from('categories').update(categoryData).eq('id', editingCategory.id);
        error = result.error;
      } else {
        const result = await supabase.from('categories').insert([categoryData]).select();
        error = result.error;
      }

      if (error) throw error;

      toast({ title: 'تم الحفظ', description: editingCategory ? 'تم تحديث القسم بنجاح' : 'تم إنشاء القسم بنجاح' });

      resetCategoryForm();
      await fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      let errorMessage = 'حدث خطأ في حفظ القسم';
      if (err?.message?.includes('duplicate key')) errorMessage = 'الرمز المميز مستخدم بالفعل';
      else if (err?.message?.includes('permission')) errorMessage = 'ليس لديك صلاحية لإضافة الأقسام';
      toast({ title: 'خطأ', description: errorMessage, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      toast({ title: 'تم الحذف', description: 'تم حذف القسم بنجاح' });
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({ title: 'خطأ', description: 'حدث خطأ في حذف القسم', variant: 'destructive' });
    }
  };

  const assignSectionManager = async () => {
    try {
      if (!selectedUser || selectedCategories.length === 0) {
        toast({ title: 'خطأ', description: 'يرجى اختيار مستخدم وأقسام', variant: 'destructive' });
        return;
      }

      // Remove existing assignments for this user for selected categories
      await supabase.from('category_roles').delete().eq('user_id', selectedUser).in('category_id', selectedCategories);

      // Insert new assignments
      const assignments = selectedCategories.map((categoryId) => ({
        user_id: selectedUser,
        category_id: categoryId,
        role: 'moderator' as any,
      }));

      const { error } = await supabase.from('category_roles').insert(assignments);
      if (error) throw error;

      toast({ title: 'تم التعيين', description: 'تم تعيين مدير الأقسام بنجاح' });

      setSelectedUser('');
      setSelectedCategories([]);
      setAssignmentDialogOpen(false);
      fetchCategoryRoles();
    } catch (err) {
      console.error('Error assigning section manager:', err);
      toast({ title: 'خطأ', description: 'حدث خطأ في تعيين مدير الأقسام', variant: 'destructive' });
    }
  };

  const getCategoryManagers = (categoryId: string) =>
    categoryRoles
      .filter((cr) => cr.category_id === categoryId)
      .map((cr) => {
        const profile = profiles.find((p) => p.user_id === cr.user_id);
        return {
          id: cr.id,
          name: profile?.full_name || 'غير معروف',
          phone: profile?.phone || '',
        };
      });

  const removeCategoryManager = async (roleId: string) => {
    try {
      const { error } = await supabase.from('category_roles').delete().eq('id', roleId);
      if (error) throw error;
      toast({ title: 'تم الحذف', description: 'تم حذف مدير القسم بنجاح' });
      fetchCategoryRoles();
    } catch (err) {
      console.error('Error removing category manager:', err);
      toast({ title: 'خطأ', description: 'حدث خطأ في حذف مدير القسم', variant: 'destructive' });
    }
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) || category.slug.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [categories, searchTerm],
  );

  // UI helpers
  const openForEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      title: category.title,
      subtitle: category.subtitle || '',
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      parent_id: category.parent_id ?? NO_PARENT_VALUE,
    });
    setCustomFields(category.custom_fields || []);
    setCategoryDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            إدارة الأقسام
          </h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة الأقسام وتعيين مدراء الأقسام</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 w-full sm:w-auto touch-manipulation h-11">
                <UserPlus className="w-5 h-5" />
                <span>تعيين مدير أقسام</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] max-h-[90vh] flex flex-col gap-0 p-0">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle className="text-lg sm:text-xl">تعيين مدير أقسام</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">اختر مستخدم والأقسام التي سيديرها</p>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="user-select" className="text-base font-semibold flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      المستخدم
                    </Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="اختر مستخدم..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.user_id} className="text-base py-3">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{profile.full_name}</span>
                              <span className="text-xs text-muted-foreground">{profile.phone}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      الأقسام المراد إدارتها
                      {selectedCategories.length > 0 && (
                        <Badge variant="secondary" className="mr-auto">
                          {selectedCategories.length} محدد
                        </Badge>
                      )}
                    </Label>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                      {categories.map((category) => (
                        <label 
                          key={category.id} 
                          htmlFor={category.id}
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-background/60 cursor-pointer transition-colors touch-manipulation border border-transparent data-[checked=true]:border-primary/50 data-[checked=true]:bg-primary/5"
                          data-checked={selectedCategories.includes(category.id)}
                        >
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedCategories((prev) => [...prev, category.id]);
                              else setSelectedCategories((prev) => prev.filter((id) => id !== category.id));
                            }}
                            className="h-5 w-5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{category.title}</div>
                            {category.subtitle && (
                              <div className="text-xs text-muted-foreground mt-0.5">{category.subtitle}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 border-t sticky bottom-0 bg-background">
                <Button 
                  onClick={assignSectionManager} 
                  className="w-full h-12 text-base" 
                  disabled={!selectedUser || selectedCategories.length === 0}
                >
                  تعيين ({selectedCategories.length} {selectedCategories.length === 1 ? 'قسم' : 'أقسام'})
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetCategoryForm()} className="gap-2 w-full sm:w-auto touch-manipulation h-11">
                <Plus className="w-5 h-5" />
                <span>إضافة قسم</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] max-h-[90vh] flex flex-col gap-0 p-0">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle className="text-lg sm:text-xl">{editingCategory ? 'تحديث القسم' : 'إضافة قسم جديد'}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingCategory ? 'قم بتحديث معلومات القسم' : 'أضف قسم جديد للنظام'}
                </p>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">عنوان القسم *</Label>
                    <Input 
                      id="title" 
                      value={categoryForm.title} 
                      onChange={(e) => setCategoryForm((p) => ({ ...p, title: e.target.value }))} 
                      placeholder="مثال: العقارات" 
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold">الرمز المميز *</Label>
                    <Input 
                      id="slug" 
                      value={categoryForm.slug} 
                      onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value }))} 
                      placeholder="مثال: real-estate" 
                      className="h-12 text-base font-mono"
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground">يستخدم في الروابط والعناوين (حروف إنجليزية وشرطات فقط)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle" className="text-sm font-semibold">العنوان الفرعي</Label>
                    <Input 
                      id="subtitle" 
                      value={categoryForm.subtitle} 
                      onChange={(e) => setCategoryForm((p) => ({ ...p, subtitle: e.target.value }))} 
                      placeholder="وصف قصير يظهر تحت العنوان" 
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">الوصف</Label>
                    <Textarea 
                      id="description" 
                      value={categoryForm.description} 
                      onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} 
                      placeholder="وصف مفصل للقسم" 
                      className="min-h-24 text-base resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon" className="text-sm font-semibold">الأيقونة</Label>
                    <Input 
                      id="icon" 
                      value={categoryForm.icon} 
                      onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))} 
                      placeholder="Home, Building, Car, etc." 
                      className="h-12 text-base font-mono"
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground">اسم الأيقونة من مكتبة Lucide Icons</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent" className="text-sm font-semibold">القسم الأب</Label>
                    <Select
                      value={categoryForm.parent_id}
                      onValueChange={(value) => setCategoryForm((p) => ({ ...p, parent_id: value }))}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="اختر القسم الأب (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_PARENT_VALUE} className="text-base">بدون قسم أب</SelectItem>
                        {categories
                          .filter((cat) => cat.id !== editingCategory?.id)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-base">
                              {category.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">حدد قسم أب لجعل هذا القسم فرعياً منه</p>
                  </div>
                  
                  {/* Custom Fields Editor */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">الحقول المخصصة</h4>
                      <Badge variant="secondary" className="text-xs">
                        {customFields.length} حقل
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      حدد الحقول التي سيتم عرضها عند إضافة عنصر في هذا القسم
                    </p>
                    <CustomFieldsEditor 
                      fields={customFields}
                      onChange={setCustomFields}
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 border-t sticky bottom-0 bg-background flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCategoryDialogOpen(false)} 
                  className="flex-1 h-12 text-base"
                  disabled={saving}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={saveCategory} 
                  className="flex-1 h-12 text-base" 
                  disabled={saving}
                >
                  {saving ? 'جاري الحفظ...' : editingCategory ? 'تحديث' : 'إضافة'}
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
            <Input placeholder="البحث في الأقسام..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
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
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم القسم</TableHead>
                  <TableHead>الرمز المميز</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>مدراء القسم</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
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
                          {category.subtitle && <div className="text-sm text-muted-foreground">{category.subtitle}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>{category.status === 'active' ? 'نشط' : 'غير نشط'}</Badge>
                      </TableCell>
                      <TableCell>
                        {managers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {managers.map((manager) => (
                              <Badge
                                key={manager.id}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
                      <TableCell>{new Date(category.created_at).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="touch-manipulation h-8 w-8 p-0"
                            onClick={() => openForEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="touch-manipulation h-8 w-8 p-0">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف القسم</AlertDialogTitle>
                                <AlertDialogDescription>هل أنت متأكد من حذف قسم "{category.title}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCategory(category.id)}>حذف</AlertDialogAction>
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 px-1">
            {filteredCategories.map((category) => {
              const managers = getCategoryManagers(category.id);
              return (
                <Card key={category.id} className="overflow-hidden border-2 hover:border-primary/20 transition-all">
                  <CardContent className="p-0">
                    {/* Header Section */}
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-b">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                            {category.icon && (
                              <span className="text-primary">{category.icon}</span>
                            )}
                            {category.title}
                          </h3>
                          {category.subtitle && (
                            <p className="text-sm text-muted-foreground leading-snug">{category.subtitle}</p>
                          )}
                        </div>
                        <Badge 
                          variant={category.status === 'active' ? 'default' : 'secondary'} 
                          className="text-xs shrink-0"
                        >
                          {category.status === 'active' ? '🟢 نشط' : '⚪️ غير نشط'}
                        </Badge>
                      </div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded border inline-block font-mono" dir="ltr">
                        {category.slug}
                      </code>
                    </div>

                    {/* Managers Section */}
                    <div className="p-4 border-b bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">
                          مدراء القسم {managers.length > 0 && `(${managers.length})`}
                        </span>
                      </div>
                      {managers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {managers.map((manager) => (
                            <Badge
                              key={manager.id}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all touch-manipulation py-1.5 px-3"
                              onClick={() => removeCategoryManager(manager.id)}
                            >
                              <span className="font-medium">{manager.name}</span>
                              <X className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-xs text-muted-foreground bg-background/50 rounded-md border border-dashed">
                          لا يوجد مدراء لهذا القسم
                        </div>
                      )}
                    </div>

                    {/* Actions Section */}
                    <div className="p-3 flex items-center justify-between bg-background">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>📅</span>
                        {new Date(category.created_at).toLocaleDateString('ar-SA', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 px-4 touch-manipulation" 
                          onClick={() => openForEdit(category)}
                        >
                          <Edit className="w-4 h-4 ml-1.5" />
                          <span className="text-sm">تعديل</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-9 w-9 p-0 touch-manipulation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[90vw] max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف القسم</AlertDialogTitle>
                              <AlertDialogDescription className="text-base leading-relaxed">
                                هل أنت متأكد من حذف قسم <strong>"{category.title}"</strong>؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2 sm:gap-2">
                              <AlertDialogCancel className="h-11 flex-1">إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteCategory(category.id)}
                                className="h-11 flex-1"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">لا توجد أقسام</h3>
              <p className="text-muted-foreground mb-4">{searchTerm ? 'لم يتم العثور على أقسام تطابق البحث' : 'لا توجد أقسام في النظام'}</p>
              {!searchTerm && (
                <Button onClick={() => setCategoryDialogOpen(true)}>إضافة قسم جديد</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
