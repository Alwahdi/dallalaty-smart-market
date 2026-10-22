import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Brand logo: the building outline drawn in the theme's gold, with no shape
 * behind it. `text-primary` is a theme token, so the mark reads correctly in
 * both the light and the dark mode.
 */
export default function AppLogo({ className }: { className?: string }) {
  return (
    <Building2
      role="img"
      aria-label="متجر إب الشامل"
      className={cn('w-9 h-9 text-primary shrink-0', className)}
    />
  );
}
