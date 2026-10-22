import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Share2, MessageCircle, Mail, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SwipeActionsProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
  shareData?: {
    title: string;
    text: string;
    url: string;
  };
  deleteConfirmation?: {
    title?: string;
    description?: string;
  };
}

const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  onDelete,
  onShare,
  className,
  shareData,
  deleteConfirmation = {
    title: "تأكيد الحذف",
    description: "هل أنت متأكد من أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
  }
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrame = useRef<number>();

  const SWIPE_THRESHOLD = 60;
  const MAX_SWIPE = 100;

  const shareOptions = [
    {
      name: 'نسخ الرابط',
      icon: Copy,
      action: () => {
        if (shareData?.url) {
          navigator.clipboard.writeText(shareData.url);
          toast({ 
            title: '✅ تم النسخ', 
            description: 'تم نسخ الرابط إلى الحافظة',
                      });
        }
      }
    },
    {
      name: 'واتساب',
      icon: MessageCircle,
      action: () => {
        if (shareData) {
          const message = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    },
    {
      name: 'البريد الإلكتروني',
      icon: Mail,
      action: () => {
        if (shareData) {
          const subject = encodeURIComponent(shareData.title);
          const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
          window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        }
      }
    },
    {
      name: 'مشاركة متقدمة',
      icon: ExternalLink,
      action: async () => {
        if (shareData && navigator.share) {
          try {
            await navigator.share({
              title: shareData.title,
              text: shareData.text,
              url: shareData.url,
            });
          } catch (error) {
            // Fallback to clipboard
            if (shareData.url) {
              navigator.clipboard.writeText(shareData.url);
              toast({ 
                title: '✅ تم النسخ', 
                description: 'تم نسخ الرابط إلى الحافظة',
                              });
            }
          }
        } else if (shareData?.url) {
          navigator.clipboard.writeText(shareData.url);
          toast({ 
            title: '✅ تم النسخ', 
            description: 'تم نسخ الرابط إلى الحافظة',
                      });
        }
      }
    }
  ];

  const updateTransform = (deltaX: number) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    animationFrame.current = requestAnimationFrame(() => {
      // Apply smooth resistance and limits
      const resistance = 0.7;
      const limitedDeltaX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX * resistance));
      setTranslateX(limitedDeltaX);
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    updateTransform(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX.current - startX.current;

    if (deltaX < -SWIPE_THRESHOLD) {
      // Swipe left - Delete action
      setShowDeleteDialog(true);
    } else if (deltaX > SWIPE_THRESHOLD) {
      // Swipe right - Share action
      if (onShare) {
        onShare();
      } else if (shareData) {
        setShowShareSheet(true);
      }
    }

    // Smooth return to position
    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    currentX.current = e.clientX;
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDelete?.();
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging) {
        currentX.current = e.clientX;
        const deltaX = currentX.current - startX.current;
        updateTransform(deltaX);
      }
    };

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
        const deltaX = currentX.current - startX.current;

        if (deltaX < -SWIPE_THRESHOLD) {
          setShowDeleteDialog(true);
        } else if (deltaX > SWIPE_THRESHOLD) {
          if (onShare) {
            onShare();
          } else if (shareData) {
            setShowShareSheet(true);
          }
        }

        setTranslateX(0);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isDragging, onDelete, onShare, shareData]);

  return (
    <>
      <div className={cn("relative overflow-hidden", className)}>
        {/* Action backgrounds */}
        <div className="absolute inset-0 flex">
          {/* Share background (right swipe) */}
          <div 
            className={cn(
              "flex items-center justify-start pl-6 bg-gradient-to-r from-green-500/20 to-green-400/10 transition-all duration-300 ease-out",
              translateX > 0 ? "opacity-100" : "opacity-0"
            )}
            style={{ width: `${Math.max(0, translateX)}px` }}
          >
            <Share2 className={cn(
              "w-5 h-5 text-success transition-all duration-200",
              translateX > SWIPE_THRESHOLD ? "animate-pulse scale-110" : ""
            )} />
            {translateX > SWIPE_THRESHOLD && (
              <span className="mr-2 text-sm font-arabic text-success font-medium animate-fade-in">
                مشاركة
              </span>
            )}
          </div>
          
          {/* Delete background (left swipe) */}
          <div 
            className={cn(
              "flex items-center justify-end pr-6 bg-gradient-to-l from-red-500/20 to-red-400/10 transition-all duration-300 ease-out ml-auto",
              translateX < 0 ? "opacity-100" : "opacity-0"
            )}
            style={{ width: `${Math.max(0, -translateX)}px` }}
          >
            {translateX < -SWIPE_THRESHOLD && (
              <span className="ml-2 text-sm font-arabic text-destructive font-medium animate-fade-in">
                حذف
              </span>
            )}
            <Trash2 className={cn(
              "w-5 h-5 text-destructive transition-all duration-200",
              translateX < -SWIPE_THRESHOLD ? "animate-pulse scale-110" : ""
            )} />
          </div>
        </div>

        {/* Main content */}
        <div
          ref={containerRef}
          className={cn(
            "relative z-10 transition-transform duration-300 ease-out select-none cursor-grab active:cursor-grabbing",
            isDragging ? "transition-none" : ""
          )}
          style={{ transform: `translateX(${translateX}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {children}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-md" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              {deleteConfirmation.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              {deleteConfirmation.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="font-arabic bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="h-auto bg-background/95 backdrop-blur-md">
          <SheetHeader>
            <SheetTitle className="font-arabic text-right flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary-text" />
              مشاركة العنصر
            </SheetTitle>
            <SheetDescription className="font-arabic text-right">
              اختر طريقة المشاركة المفضلة لديك
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid grid-cols-2 gap-3 mt-6 pb-6">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.name}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 font-arabic hover:bg-accent/50 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    option.action();
                    setShowShareSheet(false);
                  }}
                >
                  <Icon className="w-6 h-6 text-primary-text" />
                  <span className="text-sm">{option.name}</span>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SwipeActions;