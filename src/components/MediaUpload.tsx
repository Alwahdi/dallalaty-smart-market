import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaUploadProps {
  images: string[];
  videos?: string[];
  onImagesChange: (images: string[]) => void;
  onVideosChange?: (videos: string[]) => void;
  maxImages?: number;
  maxVideos?: number;
  bucketName?: string;
  folder?: string;
}

export default function MediaUpload({ 
  images, 
  videos = [],
  onImagesChange,
  onVideosChange,
  maxImages = 5,
  maxVideos = 2,
  bucketName = 'avatars',
  folder = 'properties'
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const removeAudioFromVideo = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.src = URL.createObjectURL(file);
      video.muted = true;
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000
        });
        
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
            type: 'video/webm'
          });
          resolve(newFile);
        };
        
        video.play();
        mediaRecorder.start();
        
        const drawFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            video.remove();
            canvas.remove();
            URL.revokeObjectURL(video.src);
            return;
          }
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        };
        
        drawFrame();
      };
      
      video.onerror = () => {
        reject(new Error('Failed to process video'));
        URL.revokeObjectURL(video.src);
      };
    });
  };

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
      event.target.value = '';
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onVideosChange) return;
    
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const files = Array.from(event.target.files);
      const remainingSlots = maxVideos - videos.length;
      
      if (files.length > remainingSlots) {
        toast({
          title: "تحذير",
          description: `يمكنك إضافة ${remainingSlots} فيديو فقط`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "جاري المعالجة...",
        description: "جاري إزالة الصوت من الفيديو",
      });

      const uploadPromises = files.map(async (file) => {
        // Remove audio from video
        const processedFile = await removeAudioFromVideo(file);
        
        const fileName = `${folder}/videos/${Date.now()}-${Math.random()}.webm`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, processedFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onVideosChange([...videos, ...uploadedUrls]);

      toast({
        title: "✅ تم الرفع",
        description: "تم رفع الفيديو بدون صوت بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error: any) {
      console.error('Error uploading videos:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الفيديو",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/');

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        console.warn('Could not delete file from storage:', error);
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      toast({
        title: "تم الحذف",
        description: "تم حذف الصورة بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
    }
  };

  const handleRemoveVideo = async (videoUrl: string, index: number) => {
    if (!onVideosChange) return;
    
    try {
      const urlParts = videoUrl.split('/');
      const fileName = urlParts.slice(-3).join('/');

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        console.warn('Could not delete file from storage:', error);
      }

      const newVideos = videos.filter((_, i) => i !== index);
      onVideosChange(newVideos);

      toast({
        title: "تم الحذف",
        description: "تم حذف الفيديو بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error: any) {
      console.error('Error removing video:', error);
    }
  };

  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="images">الصور ({images.length}/{maxImages})</TabsTrigger>
        {onVideosChange && (
          <TabsTrigger value="videos">الفيديو ({videos.length}/{maxVideos})</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="images" className="space-y-4">
        <div className="flex items-center justify-between">
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
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {onVideosChange && (
        <TabsContent value="videos" className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="video-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={uploading || videos.length >= maxVideos}
                asChild
              >
                <span>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 ml-2" />
                  )}
                  إضافة فيديو
                </span>
              </Button>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                disabled={uploading || videos.length >= maxVideos}
              />
            </label>
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((videoUrl, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-video relative overflow-hidden rounded-md">
                      <video
                        src={videoUrl}
                        controls
                        muted
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                        onClick={() => handleRemoveVideo(videoUrl, index)}
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
                <Video className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  لا توجد فيديوهات مرفوعة بعد
                  <br />
                  <span className="text-xs">سيتم إزالة الصوت تلقائياً</span>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
