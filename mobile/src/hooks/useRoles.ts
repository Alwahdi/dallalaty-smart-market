import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AppRole, UserRole } from '../types';

export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback(
    (role: AppRole) => roles.some((r) => r.role === role),
    [roles]
  );

  const isAdmin = hasRole('admin');
  const isModerator = hasRole('moderator');
  const isPropertiesAdmin = hasRole('properties_admin') || isAdmin;
  const isCategoriesAdmin = hasRole('categories_admin') || isAdmin;
  const isNotificationsAdmin = hasRole('notifications_admin') || isAdmin;

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isModerator,
    isPropertiesAdmin,
    isCategoriesAdmin,
    isNotificationsAdmin,
    refreshRoles: fetchRoles,
  };
}
