import { useState } from "react";
import { Moon, Sun, Menu, Heart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Header = ({ isDark, toggleTheme }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-card backdrop-blur-md border-b border-border/50 shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* الشعار */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-glow">
              <span className="text-xl font-bold text-primary-foreground">م</span>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold font-arabic bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                متجر إب الشامل
              </h1>
              <p className="text-xs text-muted-foreground font-arabic">
                المتجر الشامل
              </p>
            </div>
          </div>

          {/* شريط البحث المركزي */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="ابحث عن شقق، أراضي، سيارات..."
                className="pr-10 bg-background/80 border-border/50 focus:ring-primary/50 font-arabic"
                dir="rtl"
              />
            </div>
          </div>

          {/* الأزرار الجانبية */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* زر المفضلة */}
            <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-colors">
              <Heart className="w-5 h-5" />
            </Button>

            {/* زر الملف الشخصي */}
            <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-colors">
              <User className="w-5 h-5" />
            </Button>

            {/* زر تبديل الوضع */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hover:bg-accent/50 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600" />
              )}
            </Button>

            {/* زر القائمة للموبايل */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-accent/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* شريط البحث للموبايل */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث هنا..."
              className="pr-10 bg-background/80 border-border/50 font-arabic"
              dir="rtl"
            />
          </div>
        </div>

        {/* القائمة المنسدلة للموبايل */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
            <div className="space-y-2 font-arabic">
              <Button variant="ghost" className="w-full justify-start text-right">
                المفضلة
              </Button>
              <Button variant="ghost" className="w-full justify-start text-right">
                حسابي
              </Button>
              <Button variant="ghost" className="w-full justify-start text-right">
                إضافة إعلان
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;