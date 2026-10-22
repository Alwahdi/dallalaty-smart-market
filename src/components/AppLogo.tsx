import { cn } from '@/lib/utils';

/** Brand logo (gold building on dark tile). Single source for the logo across the app. */
export default function AppLogo({ className }: { className?: string }) {
  return <img src="/favicon.svg" alt="متجر إب الشامل" className={cn('w-9 h-9 rounded-xl shrink-0', className)} />;
}
