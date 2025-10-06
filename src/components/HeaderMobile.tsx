import { useState, useEffect } from "react";
import { Moon, Sun, Search, Bell, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "@/components/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import appIcon from "@/assets/app-icon.png";

interface HeaderMobileProps {
  isDark: boolean;
  toggleTheme: () => void;
  showSearch?: boolean;
}

const HeaderMobile = ({ isDark, toggleTheme, showSearch = true }: HeaderMobileProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAnyAdmin, loading: rolesLoading } = useRoles();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
      <header className="sticky top-0 z-40 bg-gradient-card backdrop-blur-md border-b border-border/50 shadow-card md:hidden">
      <div className="px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* الشعار */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
            </div>
            <div className="text-right min-w-0">
              <h1 className="text-base sm:text-lg font-bold font-arabic bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent truncate">
                متجر إب الشامل
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-arabic leading-none">
                المتجر الشامل
              </p>
            </div>
          </div>

          {/* الأزرار الجانبية */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse">
            {showSearch && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent/50 transition-colors h-9 w-9 touch-manipulation"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}

            {/* مركز الإشعارات */}
            <NotificationCenter className="hover:bg-accent/50 transition-colors touch-manipulation" />

            {/* أيقونة المستخدم */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-colors h-9 w-9 touch-manipulation">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {user?.email?.[0].toUpperCase() || 'د'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-background/95 backdrop-blur-md border-border/50 z-50">
                <DropdownMenuItem onClick={() => navigate('/account')} className="font-arabic touch-manipulation">
                  <User className="w-4 h-4 ml-2" />
                  إعدادات الحساب
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/favorites')} className="font-arabic touch-manipulation">
                  <Bell className="w-4 h-4 ml-2" />
                  المفضلة
                </DropdownMenuItem>
                {isAnyAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="font-arabic text-primary font-medium touch-manipulation">
                      <Shield className="w-4 h-4 ml-2" />
                      لوحة الإدارة
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="font-arabic text-red-600 touch-manipulation">
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* شريط البحث المنزلق */}
        {isSearchOpen && (
          <div className="mt-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="ابحث عن شقق، أراضي، سيارات..."
                className="pr-10 bg-background/80 border-border/50 font-arabic"
                dir="rtl"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderMobile;