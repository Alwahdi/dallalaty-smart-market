import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import Onboarding from "@/components/Onboarding";
import HeaderNew from "@/components/HeaderNew";
import HeaderMobile from "@/components/HeaderMobile";
import BottomNavigation from "@/components/BottomNavigation";
import Hero from "@/components/Hero";
import ExploreSection from "@/components/ExploreSection";
import SearchSection from "@/components/SearchSection";
import PropertyCard from "@/components/PropertyCardNew";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-apartment-backup.jpg";

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


  // بيانات تجريبية للعقارات المميزة
  const featuredProperties = [
    {
      id: "1",
      title: "شقة فاخرة في الرياض - حي النرجس",
      price: "٤٥٠,٠٠٠ ريال",
      location: "الرياض، النرجس",
      area: "٢٥٠ متر مربع",
      bedrooms: 4,
      bathrooms: 3,
      type: "sale" as const,
      status: "new" as const,
      images: [heroImage],
      isLiked: false
    },
    {
      id: "2",
      title: "فيلا مودرن في جدة مع حديقة خاصة",
      price: "٨,٥٠٠ ريال/شهر",
      location: "جدة، الحمراء",
      area: "٤٠٠ متر مربع", 
      bedrooms: 5,
      bathrooms: 4,
      type: "rent" as const,
      status: "new" as const,
      images: [heroImage],
      isLiked: true
    },
    {
      id: "3",
      title: "شقة عائلية في الدمام قريبة من البحر",
      price: "٣٢٠,٠٠٠ ريال",
      location: "الدمام، الكورنيش",
      area: "١٨٠ متر مربع",
      bedrooms: 3,
      bathrooms: 2,
      type: "sale" as const,
      status: "used" as const,
      images: [heroImage],
      isLiked: false
    },
    {
      id: "4",
      title: "أرض تجارية في مكة المكرمة موقع استراتيجي",
      price: "١,٢٠٠,٠٠٠ ريال",
      location: "مكة، العزيزية",
      area: "٦٠٠ متر مربع",
      type: "sale" as const,
      status: "new" as const,
      images: [heroImage],
      isLiked: false
    }
  ];

  const handlePropertyLike = (id: string) => {
    console.log("تم الإعجاب بالعقار:", id);
  };

  const handlePropertyShare = (id: string) => {
    console.log("تم مشاركة العقار:", id);
  };

  const handlePropertyContact = (id: string) => {
    // فتح واتساب
    window.open("https://wa.me/966500000000?text=مرحباً، أود الاستفسار عن هذا العقار");
  };

  const handlePropertyClick = (id: string) => {
    console.log("تم النقر على العقار:", id);
  };


  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setProperties(data);
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

        {/* القسم الترويجي */}
        <Hero />

        {/* البحث المتقدم */}
        <SearchSection />

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
              {properties.map((property, index) => (
                <div key={property.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
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
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent font-arabic">
              متجر إب الشامل
            </h3>
            <p className="text-muted-foreground mt-2 font-arabic">
              متجرك الذكي للأقسام والعروض
            </p>
          </div>
          
          <div className="text-muted-foreground text-sm font-arabic">
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
