import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  location: string | null;
  city: string | null;
  area: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  listing_type: string | null;
  type: string | null;
  status: string | null;
  category: string | null;
  images: string[] | null;
  video_url: string | null;
  amenities: string[] | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  agent_name: string | null;
  agent_phone: string | null;
  agent_whatsapp: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  custom_fields: Record<string, unknown> | null;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  description: string | null;
  parent_id: string | null;
  display_order: number | null;
  status: string | null;
  custom_fields: unknown[] | null;
}

interface UsePropertiesOptions {
  category?: string;
  search?: string;
  city?: string;
  listingType?: string;
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.city) {
        query = query.eq('city', options.city);
      }
      if (options.listingType) {
        query = query.eq('listing_type', options.listingType);
      }
      if (options.propertyType) {
        query = query.eq('property_type', options.propertyType);
      }
      if (options.priceMin) {
        query = query.gte('price', options.priceMin);
      }
      if (options.priceMax) {
        query = query.lte('price', options.priceMax);
      }
      if (options.search) {
        query = query.or(
          `title.ilike.%${options.search}%,description.ilike.%${options.search}%,location.ilike.%${options.search}%,brand.ilike.%${options.search}%,model.ilike.%${options.search}%`
        );
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (!error && data) {
        setProperties(data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [options.category, options.city, options.listingType, options.propertyType, options.priceMin, options.priceMax, options.search, options.limit]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    refreshing,
    refresh: () => fetchProperties(true),
    refetch: fetchProperties,
  };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProperty(data);
      }
      setLoading(false);
    };

    fetch();
  }, [id]);

  return { property, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetch();
  }, []);

  return { categories, loading };
}
