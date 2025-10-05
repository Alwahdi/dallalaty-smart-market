import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import { useTheme } from '@/hooks/useTheme';

export default function Terms() {
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
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  شروط الاستخدام
                </h1>
                <p className="text-muted-foreground mt-2">
                  آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  مقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  مرحباً بك في <strong className="text-foreground">متجر إب الشامل</strong>. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بشروط الاستخدام هذه.
                  يُرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا.
                </p>
                <p>
                  إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام المنصة.
                </p>
              </CardContent>
            </Card>

            {/* Definitions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  التعريفات
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong className="text-foreground">"المنصة"</strong>: تطبيق وموقع متجر إب الشامل</li>
                  <li><strong className="text-foreground">"المستخدم"</strong>: أي شخص يستخدم المنصة</li>
                  <li><strong className="text-foreground">"الدلال"</strong>: الشخص أو الجهة التي تعرض منتجات أو خدمات على المنصة</li>
                  <li><strong className="text-foreground">"العرض"</strong>: أي منتج أو خدمة معروضة على المنصة</li>
                  <li><strong className="text-foreground">"المحتوى"</strong>: النصوص، الصور، الفيديوهات، وأي بيانات أخرى على المنصة</li>
                </ul>
              </CardContent>
            </Card>

            {/* User Account */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  حساب المستخدم
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. إنشاء الحساب:</h3>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>يجب أن تكون بعمر 18 سنة أو أكثر</li>
                    <li>تقديم معلومات صحيحة ودقيقة</li>
                    <li>الحفاظ على سرية بيانات تسجيل الدخول</li>
                    <li>إخطارنا فوراً في حالة الوصول غير المصرح به</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. مسؤوليات المستخدم:</h3>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>أنت مسؤول عن جميع الأنشطة التي تتم عبر حسابك</li>
                    <li>يجب الحفاظ على تحديث معلومات الحساب</li>
                    <li>لا يجوز مشاركة حسابك مع الآخرين</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  الاستخدام المقبول
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>يجب عليك استخدام المنصة فقط:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>للأغراض القانونية المشروعة</li>
                  <li>وفقاً لجميع القوانين والأنظمة المعمول بها</li>
                  <li>بطريقة لا تنتهك حقوق الآخرين</li>
                  <li>بطريقة لا تعيق أو تتداخل مع استخدام الآخرين للمنصة</li>
                </ul>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  الأنشطة المحظورة
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>يُحظر صراحة القيام بما يلي:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>انتحال شخصية أي شخص أو كيان آخر</li>
                  <li>نشر محتوى مضلل أو احتيالي</li>
                  <li>انتهاك حقوق الملكية الفكرية</li>
                  <li>نشر محتوى مسيء أو تهديدي أو مسيء</li>
                  <li>محاولة اختراق أو إتلاف المنصة</li>
                  <li>استخدام برامج آلية لجمع البيانات</li>
                  <li>نشر فيروسات أو برامج ضارة</li>
                  <li>إرسال رسائل غير مرغوب فيها (سبام)</li>
                  <li>بيع أو شراء منتجات محظورة قانونياً</li>
                </ul>
              </CardContent>
            </Card>

            {/* Listings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  العروض والإعلانات
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">للدلالين:</h3>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>يجب أن تكون جميع المعلومات المقدمة دقيقة وصحيحة</li>
                    <li>يجب أن تملك الحق القانوني لبيع أو تأجير ما تعرضه</li>
                    <li>الصور والأوصاف يجب أن تمثل العرض بدقة</li>
                    <li>الأسعار يجب أن تكون واضحة وشاملة</li>
                    <li>نحتفظ بالحق في إزالة أي عرض لا يتوافق مع معاييرنا</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">للمشترين:</h3>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>نحن نسهل الاتصال فقط بين الأطراف</li>
                    <li>لسنا طرفاً في أي معاملة تتم خارج المنصة</li>
                    <li>يجب عليك التحقق من العروض قبل إتمام أي صفقة</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Liability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  إخلاء المسؤولية
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    تنويه مهم
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    المنصة تعمل كوسيط فقط بين الدلالين والمشترين. نحن لا نتحمل أي مسؤولية عن:
                  </p>
                </div>
                
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>دقة أو اكتمال المعلومات المقدمة من الدلالين</li>
                  <li>جودة المنتجات أو الخدمات المعروضة</li>
                  <li>النزاعات بين المشترين والدلالين</li>
                  <li>أي خسائر مالية أو أضرار ناتجة عن المعاملات</li>
                  <li>الأخطاء أو الانقطاعات في الخدمة</li>
                </ul>

                <p className="font-semibold text-foreground">
                  المنصة مقدمة "كما هي" دون أي ضمانات من أي نوع.
                </p>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  الملكية الفكرية
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  جميع حقوق الملكية الفكرية للمنصة محفوظة لنا. هذا يشمل:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>التصميم والواجهة</li>
                  <li>الشعارات والعلامات التجارية</li>
                  <li>الكود والبرمجيات</li>
                  <li>المحتوى الذي ننشره</li>
                </ul>
                <p>
                  المحتوى الذي ينشره المستخدمون يظل ملكاً لهم، لكنهم يمنحوننا ترخيصاً لاستخدامه على المنصة.
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-primary" />
                  إنهاء الحساب
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  نحتفظ بالحق في تعليق أو إنهاء حسابك في الحالات التالية:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>انتهاك شروط الاستخدام</li>
                  <li>السلوك الاحتيالي أو غير القانوني</li>
                  <li>عدم النشاط لفترة طويلة</li>
                  <li>بناءً على طلبك</li>
                </ul>
                <p>
                  يمكنك حذف حسابك في أي وقت من إعدادات الحساب.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  التغييرات على الشروط
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطارك بأي تغييرات جوهرية:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>عبر البريد الإلكتروني</li>
                  <li>من خلال إشعار على المنصة</li>
                  <li>تحديث تاريخ "آخر تحديث" في أعلى الصفحة</li>
                </ul>
                <p>
                  استمرارك في استخدام المنصة بعد التغييرات يعني موافقتك على الشروط المحدثة.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  القانون الحاكم
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                <p>
                  تخضع هذه الشروط وتفسر وفقاً لقوانين المملكة العربية السعودية. أي نزاعات تنشأ عن هذه الشروط
                  أو استخدام المنصة تخضع للاختصاص الحصري للمحاكم السعودية.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>تواصل معنا</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  إذا كان لديك أي أسئلة حول شروط الاستخدام، يمكنك التواصل معنا:
                </p>
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <p><strong className="text-foreground">البريد الإلكتروني:</strong> support@matjeri.com</p>
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
