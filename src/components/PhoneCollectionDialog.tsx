import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Loader2 } from 'lucide-react';

interface PhoneCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

export default function PhoneCollectionDialog({ 
  isOpen, 
  onClose, 
  userId, 
  userEmail 
}: PhoneCollectionDialogProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: "خطأ",
        description: "رقم الهاتف مطلوب",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Update the user profile with phone number
      const { error } = await supabase
        .from('profiles')
        .update({ phone: phone.trim() })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم الحفظ!",
        description: "تم حفظ رقم الهاتف بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving phone:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ رقم الهاتف",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            أكمل ملفك الشخصي
          </DialogTitle>
          <DialogDescription>
            إضافة رقم الهاتف يساعد المشترين على التواصل معك بسهولة. يمكنك تخطّي هذه الخطوة وإضافته لاحقاً من إعدادات الحساب.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-input">رقم الهاتف</Label>
            <Input
              id="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              dir="ltr"
              className="text-center"
            />
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onClose}
              disabled={loading}
            >
              تخطّي الآن
            </Button>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              disabled={loading || !phone.trim()}
            >
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ والمتابعة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}