import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import { useTheme } from '@/hooks/useTheme';

export default function Privacy() {
  const { isDark, toggleTheme } = useTheme();

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
            <Link to="/">
              <Button variant="outline" size="sm" className="mb-6">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-4 animate-fade-in">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  سياسة الخصوصية
                </h1>
                <p className="text-muted-foreground mt-2">
                  آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Introduction */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  مقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  نحن في <strong className="text-foreground">متجر إب الشامل</strong> نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية.
                  توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا.
                </p>
                <p>
                  باستخدامك للمنصة، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  المعلومات التي نجمعها
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. معلومات الحساب:</h3>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>الاسم الكامل</li>
                    <li>البريد الإلكتروني</li>
                    <li>رقم الهاتف</li>
                    <li>صورة الملف الشخصي (اختياري)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. معلومات الاستخدام:</h3>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>سجل التصفح داخل المنصة</li>
                    <li>العروض المفضلة</li>
                    <li>عمليات البحث</li>
                    <li>التفاعلات مع المحتوى</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. معلومات تقنية:</h3>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>عنوان IP</li>
                    <li>نوع المتصفح ونظام التشغيل</li>
                    <li>بيانات الجهاز</li>
                    <li>معلومات الموقع التقريبية (عند الموافقة)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  كيف نستخدم معلوماتك
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>توفير وتحسين خدماتنا</li>
                  <li>التواصل معك بخصوص حسابك والعروض</li>
                  <li>تخصيص تجربتك على المنصة</li>
                  <li>منع الاحتيال وضمان الأمان</li>
                  <li>الامتثال للمتطلبات القانونية</li>
                  <li>إرسال إشعارات مهمة حول الخدمة</li>
                  <li>تحليل استخدام المنصة لتحسين الأداء</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  حماية البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>نتخذ تدابير أمنية صارمة لحماية معلوماتك الشخصية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>قيود صارمة على الوصول للبيانات</li>
                  <li>مراقبة أمنية مستمرة</li>
                  <li>نسخ احتياطي منتظم للبيانات</li>
                  <li>مصادقة متعددة العوامل</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  تواصل معنا
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، يمكنك التواصل معنا:
                </p>
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <p><strong className="text-foreground">البريد الإلكتروني:</strong> privacy@matjeri.com</p>
                  <p><strong className="text-foreground">الهاتف:</strong> +966 50 123 4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}
