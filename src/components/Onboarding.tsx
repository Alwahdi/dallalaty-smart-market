import { useState, createElement } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Search, Heart, MessageCircle, CheckCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Search,
      title: "اكتشف العروض المميزة",
      description: "تصفح آلاف العناصر: السيارات، الأثاث، الإلكترونيات والمزيد",
      features: [
        "بحث متقدم وفلترة دقيقة",
        "عروض محدثة يومياً",
        "جميع التصنيفات في مكان واحد"
      ],
      gradient: "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
    },
    {
      icon: Heart,
      title: "احفظ المفضلات",
      description: "أضف العروض المهمة إلى قائمة المفضلات وتابعها بسهولة",
      features: [
        "حفظ غير محدود للعروض",
        "تنظيم المفضلات حسب الفئة",
        "إشعارات عند تحديث الأسعار"
      ],
      gradient: "bg-gradient-to-br from-pink-500/20 to-red-500/20"
    },
    {
      icon: MessageCircle,
      title: "تواصل مباشر",
      description: "تواصل مع البائعين مباشرة عبر واتساب بضغطة واحدة",
      features: [
        "تواصل فوري عبر واتساب",
        "معلومات البائع محققة",
        "دردشة آمنة ومحمية"
      ],
      gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* مؤشر التقدم */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 space-x-reverse">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* محتوى الخطوة */}
          <div className="text-center animate-fade-in">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${steps[currentStep].gradient}`}>
              {createElement(steps[currentStep].icon, { className: "w-10 h-10 text-primary" })}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4 font-arabic">
              {steps[currentStep].title}
            </h2>

            <p className="text-muted-foreground mb-6 font-arabic leading-relaxed">
              {steps[currentStep].description}
            </p>

            <div className="space-y-3 mb-8">
              {steps[currentStep].features.map((feature, index) => (
                <div key={index} className="flex items-center justify-start text-sm text-muted-foreground font-arabic">
                  <CheckCircle className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار التنقل */}
          <div className="flex justify-between items-center">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center font-arabic"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                السابق
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={skipOnboarding}
                className="text-muted-foreground font-arabic"
              >
                تخطي
              </Button>
            )}

            <Button
              onClick={nextStep}
              className="flex items-center font-arabic"
            >
              {currentStep === steps.length - 1 ? 'ابدأ الآن' : 'التالي'}
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </div>

          {/* رقم الخطوة */}
          <div className="text-center mt-6">
            <span className="text-sm text-muted-foreground font-arabic">
              {currentStep + 1} من {steps.length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;