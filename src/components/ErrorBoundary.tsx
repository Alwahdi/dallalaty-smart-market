import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold font-arabic">حدث خطأ غير متوقع</h1>
            <p className="text-muted-foreground font-arabic">
              نأسف للإزعاج. يمكنك تحديث الصفحة للمحاولة مرة أخرى.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-muted-foreground font-mono break-all bg-muted p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>تحديث الصفحة</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                الصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
