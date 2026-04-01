export type AppRole = 'admin' | 'moderator' | 'user' | 'properties_admin' | 'categories_admin' | 'notifications_admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  is_active: boolean;
  user_type: string | null;
  push_token: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  category: string | null;
  property_type: string | null;
  images: string[];
  videos: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  location: string | null;
  city: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  listing_type: string | null;
  amenities: string[];
  agent_name: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  condition: string | null;
  size: string | null;
  material: string | null;
  custom_data: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  subtitle: string | null;
  custom_fields: Record<string, unknown> | null;
  status: string;
  order_index: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  properties?: Property;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
