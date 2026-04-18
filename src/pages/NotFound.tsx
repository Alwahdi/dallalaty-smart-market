import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <AlertTriangle className="w-24 h-24 mx-auto text-destructive mb-4" />
          <h1 className="text-6xl font-bold text-foreground mb-4 font-arabic">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2 font-arabic">
            الصفحة غير موجودة
          </h2>
          <p className="text-muted-foreground text-lg font-arabic mb-8">
            عذراً، لا يمكن العثور على الصفحة التي تبحث عنها
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 font-arabic">
              <Home className="w-4 h-4 ml-2" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
          
          <Link to="/properties">
            <Button variant="outline" className="w-full font-arabic">
              تصفح العناصر
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground font-arabic">
          <p>المسار المطلوب: <span className="font-mono">{location.pathname}</span></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
