import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Shield, Users, Star, ArrowLeft, CheckCircle, MapPin, Heart, Zap, Car, Sofa, Smartphone, Shirt } from 'lucide-react';
import AppLogo from '@/components/AppLogo';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className={`min-h-screen bg-background font-arabic `} dir="rtl">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogo className="w-10 h-10" />
              <span className="text-xl md:text-2xl font-bold text-primary-text">متجر إب الشامل</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                تسجيل الدخول
              </Button>
              <Button onClick={() => navigate('/auth?mode=signup')}>
                إنشاء حساب
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-hero">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary-glow/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="text-primary-text">
                    منصتك الذكية
                  </span>
                  <br />
                  <span className="text-foreground">للعروض المميزة</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  اكتشف أفضل العناصر والمستلزمات في اليمن. سيارات، أثاث، إلكترونيات والمزيد بأسعار لا تُقاوم
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8"
                  onClick={handleGetStarted}
                >
                  ابدأ الآن
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  اعرف المزيد
                </Button>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-4 text-sm text-muted-foreground">
                {['تصفح مجاني', 'تواصل مباشر مع البائع', 'أسعار بالريال اليمني والسعودي والدولار'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />{t}</li>
                ))}
              </ul>
            </div>

            {/* Category preview */}
            <div className="grid grid-cols-2 gap-4" aria-hidden="true">
              {[
                { icon: Car, label: 'سيارات' },
                { icon: Sofa, label: 'أثاث' },
                { icon: Smartphone, label: 'إلكترونيات' },
                { icon: Shirt, label: 'ملابس' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-border/50 bg-card p-6 shadow-card flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary-text" />
                  </div>
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">لماذا متجر إب الشامل؟</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نقدم لك تجربة فريدة في البحث والعثور على أفضل العروض
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'بحث ذكي',
                description: 'ابحث بسهولة عن العروض المناسبة لك مع خيارات تصفية متقدمة'
              },
              {
                icon: Shield,
                title: 'أمان وموثوقية',
                description: 'حسابات مرتبطة برقم هاتف يمني وإمكانية الإبلاغ عن أي إعلان مخالف'
              },
              {
                icon: Zap,
                title: 'سرعة وسهولة',
                description: 'واجهة سهلة الاستخدام تتيح لك الوصول للعروض في ثوانٍ'
              },
              {
                icon: Users,
                title: 'مجتمع نشط',
                description: 'انضم لمجتمع من المشترين والبائعين النشطين'
              },
              {
                icon: Heart,
                title: 'مفضلاتك',
                description: 'احفظ العروض المفضلة لديك وارجع إليها متى شئت'
              },
              {
                icon: MapPin,
                title: 'بحث بالموقع',
                description: 'ابحث عن العروض القريبة منك أو في المنطقة التي تفضلها'
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 border-border/30 hover:border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-primary-text" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">كيف يعمل؟</h2>
            <p className="text-xl text-muted-foreground">خطوات بسيطة للبدء</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'أنشئ حسابك',
                description: 'سجل حساب جديد في ثوانٍ معدودة'
              },
              {
                step: '2',
                title: 'ابحث واستكشف',
                description: 'تصفح العروض أو ابحث عن ما تريد'
              },
              {
                step: '3',
                title: 'تواصل واشتري',
                description: 'تواصل مع البائع مباشرة واحصل على أفضل سعر'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-primary-foreground">
              ابدأ رحلتك معنا اليوم
            </h2>
            <p className="text-xl text-primary-foreground/85 mb-8">
              أنشئ حسابك مجاناً وابدأ البيع والشراء في إب
            </p>
            <Button 
              size="lg" 
              variant="secondary" className="bg-background text-foreground hover:bg-background/90 text-lg px-8"
              onClick={handleGetStarted}
            >
              ابدأ الآن مجاناً
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-primary-text">
                متجر إب الشامل
              </h3>
              <span className="text-muted-foreground">منصتك الذكية للعروض</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-foreground underline-offset-4 hover:underline" onClick={() => navigate('/privacy')}>سياسة الخصوصية</button>
              <span>•</span>
              <span>© {new Date().getFullYear()} متجر إب الشامل. جميع الحقوق محفوظة</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;