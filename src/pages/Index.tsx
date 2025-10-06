import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import Onboarding from "@/components/Onboarding";
import HeaderNew from "@/components/HeaderNew";
import HeaderMobile from "@/components/HeaderMobile";
import BottomNavigation from "@/components/BottomNavigation";
import ExploreSection from "@/components/ExploreSection";
import PropertyCard from "@/components/PropertyCardNew";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users
  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(`hasSeenOnboarding_${user.id}`);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`hasSeenOnboarding_${user.id}`, 'true');
      setShowOnboarding(false);
    }
  };


  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) {
        console.error('Error fetching properties:', error);
      } else if (data) {
        console.log('Fetched properties:', data.length);
        setProperties(data);
      }
      setLoadingProperties(false);
    };
    fetchProperties();
  }, []);

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      
      {/* Mobile Header */}
      <div className="block md:hidden">
        <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      
      <main className="pb-20 md:pb-0">
        {/* الأقسام الرئيسية - أول قسم في الصفحة */}
        <ExploreSection />

        {/* العروض المميزة */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-arabic">
                العروض المميزة
              </h2>
              <p className="text-muted-foreground text-lg font-arabic">
                أحدث وأفضل العروض العقارية المتاحة حالياً
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loadingProperties ? (
                [...Array(8)].map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))
              ) : properties.length > 0 ? (
                properties.map((property, index) => (
                  <div key={property.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <PropertyCard property={property} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">لا توجد عروض متاحة حالياً</p>
                </div>
              )}
            </div>

            <div className="text-center mt-12">
              <Link to="/properties" className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold hover:shadow-glow transition-all duration-300 font-arabic inline-block">
                عرض المزيد من العقارات
              </Link>
            </div>
          </div>
        </section>

        {/* إحصائيات ومميزات */}
        <section className="py-16 px-4 bg-gradient-hero">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-arabic">
              لماذا تختار متجر إب الشامل؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "أمان وثقة",
                  description: "جميع الدلالين معتمدين ومصرح لهم",
                  icon: "🛡️"
                },
                {
                  title: "تنوع كبير",
                  description: "آلاف العروض في جميع التصنيفات",
                  icon: "🏘️"
                },
                {
                  title: "سهولة التواصل",
                  description: "تواصل مباشر عبر واتساب",
                  icon: "📱"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2 font-arabic">{feature.title}</h3>
                  <p className="text-muted-foreground font-arabic">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* الفوتر */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent font-arabic mb-4">
                متجر إب الشامل
              </h3>
              <p className="text-muted-foreground font-arabic">
                متجرك الذكي للأقسام والعروض. نربط بين الدلالين والمشترين بكل سهولة وأمان.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-foreground font-arabic mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/properties" className="text-muted-foreground hover:text-primary transition-colors font-arabic">
                    تصفح العروض
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="text-muted-foreground hover:text-primary transition-colors font-arabic">
                    المفضلة
                  </Link>
                </li>
                <li>
                  <Link to="/account-settings" className="text-muted-foreground hover:text-primary transition-colors font-arabic">
                    الحساب
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-bold text-foreground font-arabic mb-4">قانوني</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-arabic">
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors font-arabic">
                    شروط الاستخدام
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground text-sm font-arabic border-t border-border pt-6">
            <p>© ٢٠٢٤ متجر إب الشامل. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
