import { useState, useEffect } from "react";
import { Moon, Sun, Menu, Heart, User, Search, Building2, LogOut, Settings, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import NotificationCenter from '@/components/NotificationCenter';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Header = ({ isDark, toggleTheme }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { isAnyAdmin } = useRoles();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-card backdrop-blur-md border-b border-border/50 shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* الشعار */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-glow">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold font-arabic bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                متجر إب الشامل
              </h1>
              <p className="text-xs text-muted-foreground font-arabic">
                المتجر الشامل لكل الأقسام
              </p>
            </div>
          </Link>

          {/* شريط البحث المركزي */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="ابحث عن العقارات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-background/80 border-border/50 focus:ring-primary/50 font-arabic"
                dir="rtl"
              />
            </form>
          </div>

          {/* الأزرار الجانبية */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* زر العقارات */}
            <Button 
              variant="ghost" 
              className="hidden sm:flex font-arabic hover:bg-accent/50"
              asChild
            >
              <Link to="/properties">جميع العروض</Link>
            </Button>

            {/* الإشعارات */}
            {user && <NotificationCenter />}

            {/* زر الملف الشخصي أو تسجيل الدخول */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent/50 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none font-arabic">مرحباً!</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    <span className="font-arabic">الملف الشخصي</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="font-arabic">إعدادات الحساب</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span className="font-arabic">المفضلات</span>
                  </DropdownMenuItem>
                  {isAnyAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span className="font-arabic text-primary">لوحة الإدارة</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-arabic">تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent/50 transition-colors"
                onClick={() => navigate('/auth')}
              >
                <User className="w-5 h-5" />
              </Button>
            )}

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
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث عن العقارات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-background/80 border-border/50 font-arabic"
              dir="rtl"
            />
          </form>
        </div>

        {/* القائمة المنسدلة للموبايل */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
            <div className="space-y-2 font-arabic">
              <Button variant="ghost" className="w-full justify-start text-right" asChild>
                <Link to="/properties">جميع العروض</Link>
              </Button>
              {user ? (
                <>
                  <Button variant="ghost" className="w-full justify-start text-right" asChild>
                    <Link to="/favorites">المفضلات</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-right" asChild>
                    <Link to="/account">إعدادات الحساب</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-right" onClick={handleSignOut}>
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="w-full justify-start text-right" asChild>
                  <Link to="/auth">تسجيل الدخول</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;