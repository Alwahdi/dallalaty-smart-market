import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'properties_admin' | 'categories_admin' | 'notifications_admin' | 'moderator' | 'user';

export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('[useRoles] Database error:', error);
          setRoles(['user']);
        } else if (data && data.length > 0) {
          setRoles(data.map(r => r.role as UserRole));
        } else {
          setRoles(['user']);
        }
      } catch (error) {
        console.error('[useRoles] Exception while fetching roles:', error);
        setRoles(['user']);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    if (user) {
      const channel = supabase
        .channel(`user_roles_changes_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_roles',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            setTimeout(() => fetchRoles(), 500);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const hasRole = (role: UserRole): boolean => roles.includes(role);
  
  const isAdmin = hasRole('admin');
  const isPropertiesAdmin = hasRole('properties_admin') || isAdmin;
  const isCategoriesAdmin = hasRole('categories_admin') || isAdmin;
  const isNotificationsAdmin = hasRole('notifications_admin') || isAdmin;
  const isModerator = hasRole('moderator');
  const isAnyAdmin = isAdmin || isPropertiesAdmin || isCategoriesAdmin || isNotificationsAdmin || isModerator;

  return { 
    roles, 
    loading, 
    hasRole, 
    isAdmin, 
    isPropertiesAdmin, 
    isCategoriesAdmin, 
    isNotificationsAdmin,
    isModerator,
    isAnyAdmin
  };
}