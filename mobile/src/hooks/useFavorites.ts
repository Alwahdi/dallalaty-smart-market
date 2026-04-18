import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Favorite, Property } from '../types';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, properties(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
      setFavoriteIds(new Set((data || []).map((f: Favorite) => f.property_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.has(propertyId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user) return;

      if (favoriteIds.has(propertyId)) {
        // Remove favorite
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
        setFavorites((prev) => prev.filter((f) => f.property_id !== propertyId));

        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) {
          console.error('Error removing favorite:', error);
          fetchFavorites();
        }
      } else {
        // Add favorite
        setFavoriteIds((prev) => new Set([...prev, propertyId]));

        const { data, error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: propertyId })
          .select('*, properties(*)')
          .single();

        if (error) {
          console.error('Error adding favorite:', error);
          fetchFavorites();
        } else if (data) {
          setFavorites((prev) => [data, ...prev]);
        }
      }
    },
    [user, favoriteIds, fetchFavorites]
  );

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    refreshFavorites: fetchFavorites,
    favoriteCount: favorites.length,
  };
}
