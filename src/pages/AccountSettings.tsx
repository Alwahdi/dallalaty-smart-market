import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Camera, 
  Save, 
  Shield, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Loader2, 
  Upload,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
}

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Redirect unauthenticated users
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || ''
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الملف الشخصي",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      
      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث صورة الملف الشخصي بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.full_name?.trim()) {
        toast({
          title: "خطأ",
          description: "الاسم الكامل مطلوب",
          variant: "destructive"
        });
        return;
      }

      if (!formData.phone?.trim()) {
        toast({
          title: "خطأ",
          description: "رقم الهاتف مطلوب",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          bio: formData.bio?.trim() || null,
          location: formData.location?.trim() || null,
          website: formData.website?.trim() || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "✅ تم الحفظ",
        description: "تم حفظ بيانات الملف الشخصي بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      fetchProfile();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور الجديدة غير متطابقة",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث كلمة المرور بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: "✅ تم الإرسال",
        description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      <div className="block md:hidden">
        <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} />
      </div>
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground font-arabic flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              إعدادات الحساب
            </h1>
            <p className="text-muted-foreground font-arabic">
              إدارة ملفك الشخصي وإعدادات الأمان
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="font-arabic">الملف الشخصي</TabsTrigger>
              <TabsTrigger value="security" className="font-arabic">الأمان</TabsTrigger>
              <TabsTrigger value="preferences" className="font-arabic">التفضيلات</TabsTrigger>
              <TabsTrigger value="account" className="font-arabic">الحساب</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">الملف الشخصي</CardTitle>
                  <CardDescription className="font-arabic">
                    قم بتحديث معلومات ملفك الشخصي وصورتك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {formData.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 cursor-pointer transition-colors">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold font-arabic">{formData.full_name || 'المستخدم'}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <Badge variant="outline" className="mt-2">
                        <CheckCircle2 className="w-3 h-3 ml-1" />
                        موثق
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2 font-arabic">
                        <User className="w-4 h-4" />
                        الاسم الكامل
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 font-arabic">
                        <Phone className="w-4 h-4" />
                        رقم الهاتف (لا يمكن التعديل)
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        disabled
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 font-arabic">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني (لا يمكن التعديل)
                      </Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        placeholder="email@example.com"
                        dir="ltr"
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2 font-arabic">
                        <MapPin className="w-4 h-4" />
                        الموقع
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="الرياض، السعودية"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2 font-arabic">
                        <Globe className="w-4 h-4" />
                        الموقع الإلكتروني
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="font-arabic">نبذة شخصية</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="اكتب نبذة مختصرة عنك..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleProfileUpdate} disabled={loading} className="font-arabic">
                    {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                    حفظ التغييرات
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-arabic flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      تغيير كلمة المرور
                    </CardTitle>
                    <CardDescription className="font-arabic">
                      قم بتحديث كلمة المرور لحسابك لضمان الأمان
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="font-arabic">كلمة المرور الجديدة</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="أدخل كلمة المرور الجديدة"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-arabic">تأكيد كلمة المرور</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                        dir="ltr"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handlePasswordUpdate} disabled={loading} className="font-arabic">
                        {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                        تحديث كلمة المرور
                      </Button>
                      
                      <Button onClick={handlePasswordReset} variant="outline" disabled={loading} className="font-arabic">
                        <Mail className="w-4 h-4 ml-2" />
                        إرسال رابط إعادة التعيين
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    إعدادات التفضيلات
                  </CardTitle>
                  <CardDescription className="font-arabic">
                    تخصيص تفضيلاتك وإعدادات التطبيق
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-arabic text-sm font-medium">نمط العرض</Label>
                        <p className="text-xs text-muted-foreground font-arabic">
                          اختر النمط المفضل لديك للتطبيق
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <Button 
                        variant={!isDark ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => {
                          setIsDark(false);
                          document.documentElement.classList.remove('dark');
                          localStorage.setItem('dalalati-theme', 'light');
                        }}
                        className="flex flex-col h-auto p-3 font-arabic"
                      >
                        <Sun className="w-4 h-4 mb-1" />
                        فاتح
                      </Button>
                      
                      <Button 
                        variant={isDark ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => {
                          setIsDark(true);
                          document.documentElement.classList.add('dark');
                          localStorage.setItem('dalalati-theme', 'dark');
                        }}
                        className="flex flex-col h-auto p-3 font-arabic"
                      >
                        <Moon className="w-4 h-4 mb-1" />
                        مظلم
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                          setIsDark(systemPrefersDark);
                          document.documentElement.classList.toggle('dark', systemPrefersDark);
                          localStorage.setItem('dalalati-theme', 'system');
                        }}
                        className="flex flex-col h-auto p-3 font-arabic"
                      >
                        <Globe className="w-4 h-4 mb-1" />
                        النظام
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label className="font-arabic text-sm font-medium">إعدادات الإشعارات</Label>
                      <p className="text-xs text-muted-foreground font-arabic">
                        تحكم في كيفية تلقي الإشعارات
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-arabic">إشعارات العروض الجديدة</Label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="font-arabic">إشعارات الرسائل</Label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="font-arabic">إشعارات التحديثات</Label>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Language Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label className="font-arabic text-sm font-medium">اللغة</Label>
                      <p className="text-xs text-muted-foreground font-arabic">
                        اختر لغة التطبيق المفضلة
                      </p>
                    </div>
                    
                    <select className="w-full p-2 border rounded-md bg-background font-arabic" dir="rtl">
                      <option value="ar" selected>العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    معلومات الحساب
                  </CardTitle>
                  <CardDescription className="font-arabic">
                    تفاصيل حسابك وإعدادات الأمان
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="font-medium font-arabic">البريد الإلكتروني</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Badge variant="outline" className="mt-2">موثق</Badge>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span className="font-medium font-arabic">رقم الهاتف</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {profile?.phone || 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="font-medium font-arabic">حالة الحساب</span>
                        </div>
                        <p className="text-sm text-green-600">نشط ومفعل</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="font-medium font-arabic">الأمان</span>
                        </div>
                        <p className="text-sm text-muted-foreground">محمي بكلمة مرور قوية</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 font-arabic">تفعيل المصادقة الثنائية</p>
                      <p className="text-sm text-yellow-700 font-arabic">
                        احم حسابك بطبقة إضافية من الأمان (قريباً)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}