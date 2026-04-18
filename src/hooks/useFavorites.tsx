import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FavoriteProperty {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  city: string | null;
  category: string;
  listing_type: string | null;
  neighborhood: string | null;
  images: string[];
  agent_name: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  custom_data?: Record<string, any>;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property_id,
          properties (
            id,
            title,
            description,
            price,
            location,
            city,
            category,
            listing_type,
            neighborhood,
            images,
            agent_name,
            agent_phone,
            agent_email,
            custom_data
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteProperties = (data?.map(item => item.properties).filter(Boolean) as unknown) as FavoriteProperty[];
      const ids = new Set(favoriteProperties.map(p => p.id));

      setFavorites(favoriteProperties || []);
      setFavoriteIds(ids);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المفضلات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (propertyId: string) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يجب تسجيل الدخول لإضافة العقارات للمفضلة",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "تنبيه",
            description: "هذا العقار موجود بالفعل في المفضلة",
            variant: "default"
          });
          return false;
        }
        throw error;
      }

      setFavoriteIds(prev => new Set([...prev, propertyId]));
      
      toast({
        title: "✅ تمت الإضافة للمفضلة",
        description: "تم إضافة العنصر إلى قائمة المفضلات بنجاح",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      return true;
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      
      setFavorites(prev => prev.filter(property => property.id !== propertyId));
      
      toast({
        title: "🗑️ تم الحذف",
        description: "تم حذف العقار من المفضلة",
        className: "bg-red-50 border-red-200 text-red-800"
      });

      return true;
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (favoriteIds.has(propertyId)) {
      return await removeFromFavorites(propertyId);
    } else {
      return await addToFavorites(propertyId);
    }
  };

  const isFavorite = (propertyId: string) => favoriteIds.has(propertyId);

  // Subscribe to real-time favorites changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch favorites when changes occur
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  return {
    favorites,
    favoriteIds,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    fetchFavorites
  };
};