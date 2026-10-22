import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User, Camera, Save, Shield, Key, Mail, Phone, MapPin, Loader2, CheckCircle2, AlertTriangle,
  LocateFixed, Monitor, Smartphone, LogOut, Moon, Bell, Trash2, Settings,
} from 'lucide-react';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import PasswordStrength from '@/components/PasswordStrength';
import { YEMEN_LOCAL_PHONE, toYemenPhone, fromYemenPhone, formatDateTime } from '@/lib/format';
import { captureGpsLocation } from '@/lib/location';
import { cropSquare } from '@/lib/image';

interface Profile {
  first_name: string | null; last_name: string | null; full_name: string | null;
  phone: string | null; phone_verified: boolean; avatar_url: string | null;
  bio: string | null; city: string | null; latitude: number | null; longitude: number | null;
}

function deviceLabel() {
  const ua = navigator.userAgent;
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'جهاز';
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'متصفح';
  return { os, br, mobile: /Mobi|Android|iPhone/i.test(ua) };
}

export default function AccountSettings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', bio: '' });

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [notif, setNotif] = useState(() => localStorage.getItem('pref-notifications') !== 'off');

  const hasPassword = !!user?.identities?.some((i) => i.provider === 'email');
  const providers: string[] = (user?.app_metadata?.providers as string[]) || [];

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('first_name,last_name,full_name,phone,phone_verified,avatar_url,bio,city,latitude,longitude')
      .eq('user_id', user.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
      setForm({
        first_name: data.first_name || '', last_name: data.last_name || '',
        phone: fromYemenPhone(data.phone), bio: data.bio || '',
      });
    }
    setLoading(false);
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'اختر صورة', variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const blob = await cropSquare(file);
      const path = `${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('user_id', user.id);
      setProfile((p) => (p ? { ...p, avatar_url: data.publicUrl } : p));
      window.dispatchEvent(new Event('profile-updated'));
      toast({ title: 'تم تحديث الصورة' });
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const saveProfile = async () => {
    if (!user) return;
    const fn = form.first_name.trim(); const ln = form.last_name.trim();
    if (fn.length < 2 || ln.length < 2) { toast({ title: 'الاسم الأول واللقب مطلوبان', variant: 'destructive' }); return; }
    if (!YEMEN_LOCAL_PHONE.test(form.phone)) { toast({ title: 'رقم الجوال غير صحيح', description: '9 أرقام تبدأ بـ 7', variant: 'destructive' }); return; }
    setSaving(true);
    const phone = toYemenPhone(form.phone);
    if (phone !== profile?.phone) {
      const { data: taken } = await supabase.from('profiles').select('user_id').eq('phone', phone).neq('user_id', user.id).maybeSingle();
      if (taken) { setSaving(false); toast({ title: 'الرقم مستخدم', description: 'هذا الرقم مسجل لحساب آخر', variant: 'destructive' }); return; }
    }
    const { error } = await supabase.from('profiles').update({
      first_name: fn, last_name: ln, full_name: `${fn} ${ln}`, phone, bio: form.bio.trim() || null,
    }).eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'خطأ', description: error.code === '23505' ? 'هذا الرقم مسجل لحساب آخر' : error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم الحفظ' });
    window.dispatchEvent(new Event('profile-updated'));
    fetchProfile();
  };

  const updateLocation = async () => {
    if (!user) return;
    setLocating(true);
    try {
      const r = await captureGpsLocation();
      await supabase.from('profiles').update(r).eq('user_id', user.id);
      setProfile((p) => (p ? { ...p, ...r } : p));
      window.dispatchEvent(new Event('profile-updated'));
      toast({ title: 'تم تحديث موقعك', description: r.city });
    } catch (e: any) {
      toast({ title: 'تعذر تحديد الموقع', description: e.message, variant: 'destructive' });
    } finally { setLocating(false); }
  };

  const changePassword = async () => {
    if (!user?.email) return;
    if (pw.next.length < 8) { toast({ title: 'كلمة المرور 8 أحرف على الأقل', variant: 'destructive' }); return; }
    if (pw.next !== pw.confirm) { toast({ title: 'كلمتا المرور غير متطابقتين', variant: 'destructive' }); return; }
    setPwSaving(true);
    if (hasPassword) {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pw.current });
      if (authErr) { setPwSaving(false); toast({ title: 'كلمة المرور الحالية غير صحيحة', variant: 'destructive' }); return; }
    }
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setPwSaving(false);
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); return; }
    toast({ title: hasPassword ? 'تم تغيير كلمة المرور' : 'تم إنشاء كلمة المرور', description: 'يمكنك الدخول بالبريد وكلمة المرور أو Google' });
    setPw({ current: '', next: '', confirm: '' });
    setPwOpen(false);
  };

  const sendResetLink = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/reset-password` });
    toast(error ? { title: 'خطأ', description: error.message, variant: 'destructive' } : { title: 'تم الإرسال', description: `أرسلنا رابط تغيير كلمة المرور إلى ${user.email}` });
  };

  const signOutOthers = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    toast(error ? { title: 'خطأ', description: error.message, variant: 'destructive' } : { title: 'تم تسجيل الخروج من الأجهزة الأخرى' });
  };

  const signOutAll = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    navigate('/landing');
  };

  if (!user && !authLoading) return <Navigate to="/auth" replace />;
  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-text" /></div>;
  }

  const initials = `${form.first_name[0] || ''}${form.last_name[0] || ''}` || user?.email?.[0]?.toUpperCase();
  const dev = deviceLabel();

  return (
    <div className="min-h-screen bg-background font-arabic" dir="rtl">
      <div className="hidden md:block"><HeaderNew isDark={isDark} toggleTheme={toggleTheme} /></div>
      <div className="block md:hidden"><HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} /></div>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile summary */}
          <Card className="overflow-hidden">
            <div className="h-20 bg-gradient-to-l from-primary/30 to-primary/5" />
            <CardContent className="-mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative w-fit">
                <Avatar className="w-24 h-24 ring-4 ring-background">
                  <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary-text">{initials}</AvatarFallback>
                </Avatar>
                <Label htmlFor="avatar-upload" aria-label="تغيير الصورة"
                  className="absolute bottom-0 left-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </Label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatar} className="hidden" disabled={uploading} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{profile?.full_name || 'المستخدم'}</h1>
                <p className="text-sm text-muted-foreground truncate" dir="ltr">{user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.city && <Badge variant="secondary"><MapPin className="w-3 h-3 ml-1" />{profile.city}</Badge>}
                  {profile?.phone_verified
                    ? <Badge><CheckCircle2 className="w-3 h-3 ml-1" />الجوال موثّق</Badge>
                    : <Badge variant="outline"><AlertTriangle className="w-3 h-3 ml-1" />الجوال غير موثّق</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile"><User className="w-4 h-4 ml-1" />الملف</TabsTrigger>
              <TabsTrigger value="security"><Shield className="w-4 h-4 ml-1" />الأمان</TabsTrigger>
              <TabsTrigger value="preferences"><Settings className="w-4 h-4 ml-1" />التفضيلات</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>البيانات الشخصية</CardTitle>
                  <CardDescription>عدّل اسمك ورقم جوالك ونبذتك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fn">الاسم الأول</Label>
                      <Input id="fn" value={form.first_name} maxLength={40} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ln">اللقب</Label>
                      <Input id="ln" value={form.last_name} maxLength={40} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ph" className="flex items-center gap-2"><Phone className="w-4 h-4" />رقم الجوال</Label>
                    <div className="flex gap-2" dir="ltr">
                      <div className="flex items-center gap-1.5 px-3 rounded-md border border-input bg-muted/50 text-sm font-medium select-none">🇾🇪 +967</div>
                      <Input id="ph" type="tel" inputMode="numeric" value={form.phone} maxLength={9} placeholder="7XXXXXXXX" className="tracking-wider"
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 9) }))} />
                    </div>
                    <p className="text-xs text-muted-foreground">تغيير الرقم يلغي حالة التوثيق.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4" />البريد الإلكتروني</Label>
                    <Input value={user?.email || ''} disabled dir="ltr" className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />الموقع</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 p-2.5 rounded-md border border-border bg-muted/40 text-sm">{profile?.city || 'لم يُحدد'}</div>
                      <Button variant="outline" onClick={updateLocation} disabled={locating}>
                        {locating ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <LocateFixed className="w-4 h-4 ml-1" />}تحديث موقعي
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">نبذة عنك</Label>
                    <Textarea id="bio" value={form.bio} maxLength={300} rows={3} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="اختياري" />
                    <p className="text-xs text-muted-foreground text-left" dir="ltr">{form.bio.length}/300</p>
                  </div>
                  <Button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}حفظ التغييرات
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />كلمة المرور وطرق الدخول</CardTitle>
                  <CardDescription>
                    طرق الدخول المفعّلة: {providers.map((p) => (p === 'google' ? 'Google' : p === 'email' ? 'البريد وكلمة المرور' : p)).join('، ') || '—'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => setPwOpen(true)}>
                    <Key className="w-4 h-4 ml-2" />{hasPassword ? 'تغيير كلمة المرور' : 'إنشاء كلمة مرور'}
                  </Button>
                  {hasPassword && (
                    <Button variant="outline" onClick={sendResetLink}><Mail className="w-4 h-4 ml-2" />إرسال رابط إلى بريدي</Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5" />الجلسات</CardTitle>
                  <CardDescription>الأجهزة المسجّل دخولها إلى حسابك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                    {dev.mobile ? <Smartphone className="w-6 h-6 text-primary-text" /> : <Monitor className="w-6 h-6 text-primary-text" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{dev.br} على {dev.os}</p>
                      <p className="text-xs text-muted-foreground">آخر دخول: <span dir="ltr">{formatDateTime(user?.last_sign_in_at)}</span></p>
                    </div>
                    <Badge>هذا الجهاز</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">لأمانك، يمكنك إنهاء كل الجلسات على الأجهزة الأخرى.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={signOutOthers}><LogOut className="w-4 h-4 ml-2" />الخروج من الأجهزة الأخرى</Button>
                    <Button variant="destructive" onClick={signOutAll}><LogOut className="w-4 h-4 ml-2" />الخروج من كل الأجهزة</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardContent className="divide-y divide-border p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3"><Moon className="w-5 h-5 text-muted-foreground" />
                      <div><p className="font-medium">الوضع الداكن</p><p className="text-xs text-muted-foreground">مريح للعين ليلاً</p></div></div>
                    <Switch checked={isDark} onCheckedChange={toggleTheme} />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-muted-foreground" />
                      <div><p className="font-medium">الإشعارات</p><p className="text-xs text-muted-foreground">تنبيهات المنتجات والعروض الجديدة</p></div></div>
                    <Switch checked={notif} onCheckedChange={(v) => { setNotif(v); localStorage.setItem('pref-notifications', v ? 'on' : 'off'); }} />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3"><Trash2 className="w-5 h-5 text-muted-foreground" />
                      <div><p className="font-medium">مسح البيانات المؤقتة</p><p className="text-xs text-muted-foreground">يحل مشاكل عرض الصفحات القديمة</p></div></div>
                    <Button variant="outline" size="sm" onClick={async () => {
                      if ('caches' in window) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); }
                      toast({ title: 'تم المسح' }); setTimeout(() => window.location.reload(), 500);
                    }}>مسح</Button>
                  </div>
                  <div className="p-4">
                    <Button variant="ghost" className="w-full text-destructive" onClick={async () => { await signOut(); navigate('/landing'); }}>
                      <LogOut className="w-4 h-4 ml-2" />تسجيل الخروج
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent dir="rtl" className="font-arabic">
          <DialogHeader>
            <DialogTitle>{hasPassword ? 'تغيير كلمة المرور' : 'إنشاء كلمة مرور'}</DialogTitle>
            <DialogDescription>{hasPassword ? 'أدخل كلمة المرور الحالية ثم الجديدة' : 'لتتمكن من الدخول بالبريد وكلمة المرور بجانب Google'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="cur">كلمة المرور الحالية</Label>
                <Input id="cur" type="password" dir="ltr" autoComplete="current-password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new">كلمة المرور الجديدة</Label>
              <Input id="new" type="password" dir="ltr" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
              <PasswordStrength password={pw.next} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf">تأكيد كلمة المرور</Label>
              <Input id="conf" type="password" dir="ltr" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
              {pw.confirm && pw.next !== pw.confirm && <p className="text-xs text-destructive">غير متطابقة</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPwOpen(false)}>إلغاء</Button>
            <Button onClick={changePassword} disabled={pwSaving || (hasPassword && !pw.current) || pw.next.length < 8 || pw.next !== pw.confirm}>
              {pwSaving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}
