import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Brand logo: Building2 SVG icon in the primary color. Single source for the logo across the app. */
export default function AppLogo({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="متجر إب الشامل"
      className={cn('w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0', className)}
    >
      <Building2 className="w-[60%] h-[60%] text-primary" aria-hidden="true" />
    </div>
  );
}
