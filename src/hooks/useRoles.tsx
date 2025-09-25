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

        console.log('Roles fetch result:', { data, error, userId: user.id });

        if (!error && data) {
          const userRoles = data.map(r => r.role as UserRole);
          console.log('User roles:', userRoles);
          setRoles(userRoles);
        } else {
          console.log('No roles found, setting default user role');
          setRoles(['user']);
        }
      } catch (error) {
        console.error('Roles fetch error:', error);
        setRoles(['user']);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // Listen for role changes in real-time
    const channel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Role change detected:', payload);
          fetchRoles(); // Refresh roles when changed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const hasRole = (role: UserRole): boolean => roles.includes(role);
  
  const isAdmin = hasRole('admin');
  const isPropertiesAdmin = hasRole('properties_admin') || isAdmin;
  const isCategoriesAdmin = hasRole('categories_admin') || isAdmin;
  const isNotificationsAdmin = hasRole('notifications_admin') || isAdmin;
  const isModerator = hasRole('moderator');
  const isAnyAdmin = isAdmin || isPropertiesAdmin || isCategoriesAdmin || isNotificationsAdmin || isModerator;

  console.log('Role calculations:', {
    roles,
    isAdmin,
    isPropertiesAdmin,
    isCategoriesAdmin,
    isNotificationsAdmin,
    isModerator,
    isAnyAdmin
  });

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