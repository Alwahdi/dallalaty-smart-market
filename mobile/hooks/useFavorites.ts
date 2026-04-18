import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (data) {
        setFavoriteIds(data.map(f => f.property_id));
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFavorites();

    if (!user?.id) return;

    // Real-time subscription
    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchFavorites]);

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.includes(propertyId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user?.id) return;

      if (isFavorite(propertyId)) {
        setFavoriteIds(prev => prev.filter(id => id !== propertyId));
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
      } else {
        setFavoriteIds(prev => [...prev, propertyId]);
        await supabase.from('favorites').insert({
          user_id: user.id,
          property_id: propertyId,
        });
      }
    },
    [user?.id, isFavorite]
  );

  return {
    favoriteIds,
    loading,
    isFavorite,
    toggleFavorite,
    refresh: fetchFavorites,
  };
}
