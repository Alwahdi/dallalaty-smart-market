import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface FavoriteProperty {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string | null;
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

/** Shared favorites state (one cached query for every card, page and badge). */
export const useFavorites = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['favorites', user?.id];

  const { data: favorites = [], isLoading, isError, refetch } = useQuery({
    queryKey: key,
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id, properties (id,title,description,price,currency,location,city,category,listing_type,neighborhood,images,agent_name,agent_phone,agent_email,custom_data)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data?.map((i) => i.properties).filter(Boolean) ?? []) as unknown as FavoriteProperty[];
    },
  });

  const favoriteIds = new Set(favorites.map((f) => f.id));
  const isFavorite = (id: string) => favoriteIds.has(id);

  const addToFavorites = async (propertyId: string) => {
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول', description: 'سجّل الدخول لحفظ العناصر في المفضلة', variant: 'destructive' });
      return false;
    }
    const { error } = await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId });
    if (error && error.code !== '23505') {
      toast({ title: 'تعذرت الإضافة', description: 'حاول مرة أخرى', variant: 'destructive' });
      return false;
    }
    await qc.invalidateQueries({ queryKey: key });
    toast({ title: 'تمت الإضافة إلى المفضلة' });
    return true;
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user) return false;
    const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
    if (error) {
      toast({ title: 'تعذر الحذف', description: 'حاول مرة أخرى', variant: 'destructive' });
      return false;
    }
    qc.setQueryData<FavoriteProperty[]>(key, (prev) => (prev ?? []).filter((p) => p.id !== propertyId));
    toast({ title: 'تم الحذف من المفضلة' });
    return true;
  };

  const toggleFavorite = (propertyId: string) =>
    isFavorite(propertyId) ? removeFromFavorites(propertyId) : addToFavorites(propertyId);

  return {
    favorites: user ? favorites : [],
    favoriteIds,
    loading: isLoading && !!user,
    error: isError,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    fetchFavorites: refetch,
  };
};
