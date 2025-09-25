import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Shield, Users, Star, ArrowLeft, CheckCircle, MapPin, Heart, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-apartment.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                متجر إب الشامل
              </h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                تسجيل الدخول
              </Button>
              <Button onClick={() => navigate('/auth')}>
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
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    منصتك الذكية
                  </span>
                  <br />
                  <span className="text-foreground">للعروض المميزة</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  اكتشف أفضل العروض العقارية والمستلزمات في مكان واحد. شقق، أراضي، أثاث، سيارات، ومستعمل بأسعار لا تُقاوم
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8"
                  onClick={handleGetStarted}
                >
                  ابدأ الآن
                  <ArrowLeft className="w-5 h-5 mr-2" />
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

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                {[
                  { number: '١٠٠٠+', label: 'عرض متاح' },
                  { number: '٥٠٠+', label: 'مستخدم نشط' },
                  { number: '٩٥٪', label: 'رضا العملاء' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src={heroImage} 
                  alt="متجر إب الشامل - منصتك الذكية للعروض"
                  className="w-full rounded-2xl shadow-elegant"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-primary rounded-2xl opacity-20 blur-xl" />
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
                description: 'جميع العروض محققة ومن مصادر موثوقة لضمان تجربة آمنة'
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
                    <feature.icon className="w-8 h-8 text-primary" />
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
                step: '١',
                title: 'أنشئ حسابك',
                description: 'سجل حساب جديد في ثوانٍ معدودة'
              },
              {
                step: '٢',
                title: 'ابحث واستكشف',
                description: 'تصفح الآلاف من العروض أو ابحث عن ما تريد'
              },
              {
                step: '٣',
                title: 'تواصل واشتري',
                description: 'تواصل مع البائع مباشرة واحصل على أفضل سعر'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold mb-4">
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
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-white">
              ابدأ رحلتك معنا اليوم
            </h2>
            <p className="text-xl text-white/90 mb-8">
              انضم إلى آلاف المستخدمين الذين يثقون في متجر إب الشامل للعثور على أفضل العروض
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              onClick={handleGetStarted}
            >
              ابدأ الآن مجاناً
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse mb-4 md:mb-0">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                متجر إب الشامل
              </h3>
              <span className="text-muted-foreground">منصتك الذكية للعروض</span>
            </div>
            <div className="flex items-center space-x-6 space-x-reverse text-sm text-muted-foreground">
              <button onClick={() => navigate('/privacy')}>سياسة الخصوصية</button>
              <span>•</span>
              <span>© ٢٠٢٥ متجر إب الشامل. جميع الحقوق محفوظة</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;