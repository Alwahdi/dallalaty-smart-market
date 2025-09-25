import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Database, Phone, Mail } from 'lucide-react';

const Privacy = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/landing" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                متجر إب الشامل
              </Link>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/landing">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
            <p className="text-xl text-muted-foreground">
              نحن ملتزمون بحماية خصوصيتك وضمان أمان بياناتك
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              آخر تحديث: يناير ٢٠٢٥
            </div>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 ml-2" />
                  مقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  مرحباً بك في منصة "متجر إب الشامل". نحن نقدر ثقتك بنا ونلتزم بحماية خصوصيتك. تشرح هذه السياسة كيفية جمعنا واستخدامنا وحماية المعلومات الشخصية التي تقدمها لنا عند استخدام منصتنا.
                </p>
                <p className="leading-relaxed">
                  باستخدام منصة متجر إب الشامل، فإنك توافق على ممارسات جمع واستخدام المعلومات المبينة في هذه السياسة.
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 ml-2" />
                  المعلومات التي نجمعها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">المعلومات الشخصية:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mr-4">
                    <li>الاسم الكامل</li>
                    <li>عنوان البريد الإلكتروني</li>
                    <li>رقم الهاتف</li>
                    <li>معلومات الملف الشخصي</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">معلومات الاستخدام:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mr-4">
                    <li>عمليات البحث والتصفح</li>
                    <li>العروض المفضلة</li>
                    <li>نشاطك على المنصة</li>
                    <li>بيانات الجهاز والمتصفح</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Data */}
            <Card>
              <CardHeader>
                <CardTitle>كيف نستخدم معلوماتك</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-3 flex-shrink-0"></div>
                    <span>تقديم وتحسين خدماتنا</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-3 flex-shrink-0"></div>
                    <span>تخصيص تجربتك على المنصة</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-3 flex-shrink-0"></div>
                    <span>التواصل معك بخصوص حسابك أو الخدمات</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-3 flex-shrink-0"></div>
                    <span>ضمان أمان المنصة ومنع الاحتيال</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-3 flex-shrink-0"></div>
                    <span>الامتثال للمتطلبات القانونية</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle>حماية البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  نحن نتخذ إجراءات أمنية صارمة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">إجراءات الأمان تشمل:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mr-4">
                    <li>تشفير البيانات أثناء النقل والتخزين</li>
                    <li>مراقبة الأنظمة على مدار الساعة</li>
                    <li>تحديثات أمنية منتظمة</li>
                    <li>تقييد الوصول للبيانات حسب الحاجة</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>مشاركة البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• بموافقتك الصريحة</li>
                  <li>• مع مقدمي الخدمات الموثوقين لتشغيل المنصة</li>
                  <li>• عند الطلب من السلطات القانونية</li>
                  <li>• لحماية حقوقنا ومستخدمينا</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>حقوقك</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">حقوق الوصول:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• عرض بياناتك المحفوظة</li>
                      <li>• طلب نسخة من معلوماتك</li>
                      <li>• تحديث بياناتك</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">حقوق التحكم:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• حذف حسابك</li>
                      <li>• سحب الموافقة</li>
                      <li>• تقييد معالجة البيانات</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>ملفات تعريف الارتباط (Cookies)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في هذه الملفات من خلال إعدادات متصفحك.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">أنواع الملفات التي نستخدمها:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mr-4">
                    <li>ملفات ضرورية لتشغيل المنصة</li>
                    <li>ملفات تحليلية لفهم استخدام المنصة</li>
                    <li>ملفات تفضيلات لحفظ إعداداتك</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 ml-2" />
                  التواصل معنا
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  إذا كان لديك أي أسئلة حول سياسة الخصوصية أو ترغب في ممارسة حقوقك، يرجى التواصل معنا:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 ml-2 text-muted-foreground" />
                    <span>privacy@dalalati.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 ml-2 text-muted-foreground" />
                    <span>+966 50 123 4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>تحديثات السياسة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">
                  قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال إشعار على المنصة. نشجعك على مراجعة هذه الصفحة بانتظام للبقاء على اطلاع بممارسات الخصوصية لدينا.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border/30 text-center">
            <p className="text-muted-foreground">
              شكراً لك على ثقتك في متجر إب الشامل. نحن ملتزمون بحماية خصوصيتك وتقديم تجربة آمنة وموثوقة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;