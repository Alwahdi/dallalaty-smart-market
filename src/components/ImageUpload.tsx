import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  bucketName?: string;
  folder?: string;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  bucketName = 'avatars',
  folder = 'properties'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const files = Array.from(event.target.files);
      const remainingSlots = maxImages - images.length;
      
      if (files.length > remainingSlots) {
        toast({
          title: "تحذير",
          description: `يمكنك إضافة ${remainingSlots} صور فقط`,
          variant: "destructive"
        });
        return;
      }

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);

      toast({
        title: "✅ تم الرفع",
        description: "تم رفع الصور بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصور",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      // Extract file path from URL for deletion
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${folder}/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.warn('Could not delete file from storage:', error);
      }

      // Remove from UI regardless of storage deletion result
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      toast({
        title: "تم الحذف",
        description: "تم حذف الصورة بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الصورة",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">الصور ({images.length}/{maxImages})</h3>
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={uploading || images.length >= maxImages}
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 ml-2" />
              )}
              إضافة صور
            </span>
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading || images.length >= maxImages}
          />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md">
                  <img
                    src={imageUrl}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                    onClick={() => handleRemoveImage(imageUrl, index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              لا توجد صور مرفوعة بعد
              <br />
              اضغط على "إضافة صور" لبدء الرفع
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}