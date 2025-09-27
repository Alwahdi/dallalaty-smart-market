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
        console.log('🔑 No user found, clearing roles');
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔑 Fetching roles for user:', user.id, user.email);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        console.log('🔑 Roles fetch result:', { 
          data, 
          error, 
          userId: user.id,
          userEmail: user.email,
          dataLength: data?.length 
        });

        if (!error && data && data.length > 0) {
          const userRoles = data.map(r => r.role as UserRole);
          console.log('🔑 User roles found:', userRoles);
          setRoles(userRoles);
        } else {
          console.log('🔑 No roles found in database, setting default user role');
          setRoles(['user']);
        }
      } catch (error) {
        console.error('🔑 Roles fetch error:', error);
        setRoles(['user']);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // Listen for role changes in real-time
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
          (payload) => {
            console.log('🔑 Real-time role change detected:', payload);
            setTimeout(() => fetchRoles(), 500); // Small delay to ensure consistency
          }
        )
        .subscribe((status) => {
          console.log('🔑 Real-time subscription status:', status);
        });

      return () => {
        console.log('🔑 Cleaning up real-time subscription');
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

  console.log('🔑 Role calculations:', {
    roles,
    isAdmin,
    isPropertiesAdmin,
    isCategoriesAdmin,
    isNotificationsAdmin,
    isModerator,
    isAnyAdmin,
    loading
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