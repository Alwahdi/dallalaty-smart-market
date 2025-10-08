import { Home, Heart } from "lucide-react";
import appIcon from "@/assets/app-icon.png";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";

const BottomNavigation = () => {
  const location = useLocation();
  const { favorites } = useFavorites();

  // Hide bottom nav on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      icon: Home,
      label: "الرئيسية",
      path: "/",
      badge: null,
    },
    {
      icon: () => <img src={appIcon} alt="العقارات" className="w-5 h-5" />,
      label: "العقارات",
      path: "/properties",
      badge: null,
    },
    {
      icon: Heart,
      label: "المفضلة",
      path: "/favorites",
      badge: favorites.length > 0 ? favorites.length : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/98 backdrop-blur-lg border-t border-border/50 shadow-lg">
      <div className="flex items-center justify-around py-2.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-300 transform touch-manipulation",
                isActive
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 mb-1 transition-all duration-300",
                  isActive ? "scale-110 drop-shadow-md" : ""
                )} />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center text-[10px] animate-pulse font-medium"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-[11px] font-arabic font-medium text-center leading-tight transition-all duration-300",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;