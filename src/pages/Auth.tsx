import { useState } from 'react';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, ChevronDown } from 'lucide-react';

export default function Auth() {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'خطأ في تسجيل الدخول', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'مرحباً بك!', description: 'تم تسجيل الدخول بنجاح' });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast({ title: 'خطأ في إنشاء الحساب', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'تم إنشاء الحساب! 🎉',
        description: 'سنطلب منك إكمال بيانات ملفك الشخصي.',
      });
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (result.error) {
      toast({ title: 'خطأ في تسجيل الدخول', description: (result.error as Error).message, variant: 'destructive' });
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4 font-arabic" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-16 w-16 text-primary drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">متجر إب الشامل</h1>
          <p className="text-muted-foreground mt-2">منصة العناصر والإعلانات الذكية</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">مرحباً بك!</CardTitle>
            <CardDescription className="text-center">
              ادخل بسهولة وسرعة باستخدام حساب Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Primary Action */}
            <Button
              type="button"
              className="w-full h-16 text-lg bg-white hover:bg-gray-50 text-gray-800 border border-border shadow-md hover:shadow-lg transition-all duration-300 font-bold rounded-2xl"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 className="ml-3 h-6 w-6 animate-spin" />
              ) : (
                <svg className="ml-3 h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="font-bold">متابعة مع Google</span>
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              سيُطلب منك بعد الدخول إكمال رقم الهاتف وبقية البيانات
            </p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowEmailForm((v) => !v)}
                  className="bg-background px-4 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border/40 hover:border-border flex items-center gap-1"
                >
                  {showEmailForm ? 'إخفاء' : 'تسجيل الدخول بالبريد الإلكتروني'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showEmailForm ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {showEmailForm && (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="signin" className="text-sm">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm">إنشاء حساب</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">كلمة المرور</label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      تسجيل الدخول
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label htmlFor="email-signup" className="text-sm font-medium">البريد الإلكتروني</label>
                      <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password-signup" className="text-sm font-medium">كلمة المرور</label>
                      <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="6 أحرف على الأقل" dir="ltr" />
                    </div>
                    <p className="text-xs text-muted-foreground">سنطلب منك إكمال الاسم ورقم الهاتف بعد التسجيل.</p>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      إنشاء حساب
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
