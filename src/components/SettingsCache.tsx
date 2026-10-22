import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { 
  useUserPreferences, 
  useNavigationCache, 
  useSearchCache
} from '@/hooks/useLocalStorage';
import { 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  Shield, 
  Database,
  Settings,
  Moon,
  Sun,
  Search,
  MapPin,
  Clock
} from 'lucide-react';

interface SettingsCacheProps {
  onClose?: () => void;
}

const SettingsCache = ({ onClose }: SettingsCacheProps) => {
  const { toast } = useToast();
  const { theme, isDark, toggleTheme } = useTheme();
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();
  const { navigationHistory, clearHistory } = useNavigationCache();
  const { recentSearches, clearRecentSearches } = useSearchCache();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleClearAllCache = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات المحفوظة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      // Clear all localStorage data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dalalati-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reset preferences
      resetPreferences();
      clearHistory();
      clearRecentSearches();
      
      toast({
        title: "تم حذف البيانات",
        description: "تم حذف جميع البيانات المحفوظة بنجاح"
      });
      
      // Reload page to reset state
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        preferences,
        navigationHistory,
        recentSearches,
        theme,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dalalati-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم تصدير البيانات",
        description: "تم تصدير إعداداتك بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير البيانات",
        variant: "destructive"
      });
    }
  };

  const getCacheSize = () => {
    let totalSize = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dalalati-')) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    });
    return `${(totalSize / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            إعدادات التطبيق والذاكرة المؤقتة
          </h2>
          <p className="text-muted-foreground mt-1">
            إدارة تفضيلاتك والبيانات المحفوظة
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        )}
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            المظهر
          </CardTitle>
          <CardDescription>
            اختر المظهر المفضل لديك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">الوضع الداكن</p>
              <p className="text-sm text-muted-foreground">تفعيل الوضع الداكن للتطبيق</p>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            تفضيلات التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">حفظ البحث تلقائياً</p>
              <p className="text-sm text-muted-foreground">حفظ مرشحات البحث عند التغيير</p>
            </div>
            <Switch
              checked={preferences.autoSaveSearch}
              onCheckedChange={(checked) => updatePreference('autoSaveSearch', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">عرض الشبكة</p>
              <p className="text-sm text-muted-foreground">عرض العناصر في شكل شبكة</p>
            </div>
            <Switch
              checked={preferences.gridView}
              onCheckedChange={(checked) => updatePreference('gridView', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">الوضع المضغوط</p>
              <p className="text-sm text-muted-foreground">عرض أكثر كثافة للمحتوى</p>
            </div>
            <Switch
              checked={preferences.compactMode}
              onCheckedChange={(checked) => updatePreference('compactMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            إحصائيات الذاكرة المؤقتة
          </CardTitle>
          <CardDescription>
            معلومات حول البيانات المحفوظة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Search className="w-8 h-8 mx-auto mb-2 text-primary-text" />
              <p className="text-2xl font-bold">{recentSearches.length}</p>
              <p className="text-sm text-muted-foreground">عمليات بحث محفوظة</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-primary-text" />
              <p className="text-2xl font-bold">{navigationHistory.length}</p>
              <p className="text-sm text-muted-foreground">صفحات في التاريخ</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-primary-text" />
              <p className="text-2xl font-bold">{getCacheSize()}</p>
              <p className="text-sm text-muted-foreground">حجم البيانات</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            النشاط الأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSearches.length > 0 && (
              <div>
                <p className="font-medium mb-2">عمليات البحث الأخيرة:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {navigationHistory.length > 0 && (
              <div>
                <p className="font-medium mb-2">الصفحات المزارة مؤخراً:</p>
                <div className="space-y-1">
                  {navigationHistory.slice(0, 3).map((route, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {route}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cache Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            إدارة البيانات
          </CardTitle>
          <CardDescription>
            تصدير واستيراد وحذف البيانات المحفوظة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExportData}
            >
              <Download className="w-4 h-4" />
              تصدير البيانات
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={clearHistory}
            >
              <RefreshCw className="w-4 h-4" />
              مسح التاريخ
            </Button>
            
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={handleClearAllCache}
            >
              <Trash2 className="w-4 h-4" />
              حذف جميع البيانات
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>نصيحة:</strong> يمكنك تصدير بياناتك قبل حذفها للاحتفاظ بنسخة احتياطية
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsCache;