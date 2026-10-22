import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '@/hooks/useRoles';

interface AdminButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export default function AdminButton({ 
  className = "", 
  variant = "ghost", 
  size = "icon",
  showText = false 
}: AdminButtonProps) {
  const navigate = useNavigate();
  const { isAnyAdmin, loading } = useRoles();

  // Don't render if user doesn't have admin permissions or still loading
  if (loading || !isAnyAdmin) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`transition-all duration-200 hover:bg-primary/10 ${className}`}
      onClick={() => navigate('/admin')}
      title="لوحة الإدارة"
    >
      <Shield className="w-4 h-4 text-primary-text" />
      {showText && <span className="mr-2 text-primary-text font-medium">لوحة الإدارة</span>}
    </Button>
  );
}