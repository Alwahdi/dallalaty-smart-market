import { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ImagePreviewProps {
  images: string[];
  index?: number;
  alt: string;
  className?: string;
}

export default function ImagePreview({ images, index = 0, alt, className = '' }: ImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(index);
  const [failed, setFailed] = useState(false);
  const image = images[index];
  if (!image) return <img src="/placeholder.svg" alt={alt} className={className} />;
  const changeImage = (delta: number) => {
    setActive(previous => (previous + delta + images.length) % images.length);
    setFailed(false);
  };
  return (
    <>
      <Button type="button" variant="ghost" aria-label={`معاينة ${alt}`} title="معاينة الصورة"
        className={`relative block h-full w-full cursor-zoom-in overflow-hidden rounded-none p-0 hover:bg-transparent ${className}`}
        onClick={event => { event.stopPropagation(); setActive(index); setFailed(false); setOpen(true); }}>
        <img src={image} alt={alt} className="h-full w-full object-cover" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="w-[96vw] max-w-6xl gap-3 p-3 pt-12 sm:p-5 sm:pt-12" onClick={event => event.stopPropagation()}>
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <TransformWrapper key={`${active}-${open}`} minScale={1} maxScale={8} centerOnInit doubleClick={{ mode: 'toggle' }}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="flex items-center justify-center gap-2" dir="ltr">
                  <Button variant="outline" size="icon" title="تصغير" aria-label="تصغير" onClick={() => zoomOut()}><ZoomOut className="h-5 w-5" /></Button>
                  <Button variant="outline" size="icon" title="الحجم الأصلي" aria-label="الحجم الأصلي" onClick={() => resetTransform()}><RotateCcw className="h-5 w-5" /></Button>
                  <Button variant="outline" size="icon" title="تكبير" aria-label="تكبير" onClick={() => zoomIn()}><ZoomIn className="h-5 w-5" /></Button>
                </div>
                <div className="image-preview-stage relative overflow-hidden bg-muted" dir="ltr">
                  <TransformComponent wrapperClass="image-preview-wrapper" contentClass="image-preview-content">
                    {failed ? <p className="text-muted-foreground">تعذر تحميل الصورة</p> :
                      <img src={images[active]} alt={alt} className="image-preview-photo" onError={() => setFailed(true)} />}
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
          {images.length > 1 && <div className="flex items-center justify-center gap-4" dir="ltr">
            <Button variant="outline" size="icon" aria-label="الصورة السابقة" title="الصورة السابقة" onClick={() => changeImage(-1)}><ChevronLeft className="h-5 w-5" /></Button>
            <span className="text-sm tabular-nums">{active + 1} / {images.length}</span>
            <Button variant="outline" size="icon" aria-label="الصورة التالية" title="الصورة التالية" onClick={() => changeImage(1)}><ChevronRight className="h-5 w-5" /></Button>
          </div>}
        </DialogContent>
      </Dialog>
    </>
  );
}