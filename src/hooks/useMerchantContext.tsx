import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useRoles } from './useRoles';
import { supabase } from '@/integrations/supabase/client';

export interface MerchantPermissions {
  can_add_products: boolean;
  can_edit_products: boolean;
  can_delete_products: boolean;
  can_manage_employees: boolean;
}

export interface EmployerMerchant {
  merchant_id: string;
  merchant_name: string | null;
  permissions: MerchantPermissions;
}

const DEFAULT_PERMS: MerchantPermissions = {
  can_add_products: true,
  can_edit_products: true,
  can_delete_products: true,
  can_manage_employees: true,
};

const EMPTY_PERMS: MerchantPermissions = {
  can_add_products: false,
  can_edit_products: false,
  can_delete_products: false,
  can_manage_employees: false,
};

export function useMerchantContext(activeMerchantId?: string) {
  const { user } = useAuth();
  const { isMerchant, isAdmin, loading: rolesLoading } = useRoles();
  const [employerMerchants, setEmployerMerchants] = useState<EmployerMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployers = async () => {
      if (!user) {
        setEmployerMerchants([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: emps, error } = await supabase
          .from('merchant_employees')
          .select('merchant_id, permissions')
          .eq('employee_id', user.id);

        if (error) {
          console.error('[useMerchantContext]', error);
          setEmployerMerchants([]);
          return;
        }

        if (!emps || emps.length === 0) {
          setEmployerMerchants([]);
          return;
        }

        const merchantIds = emps.map(e => e.merchant_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', merchantIds);

        const profMap = new Map((profiles || []).map(p => [p.user_id, p.full_name]));

        setEmployerMerchants(
          emps.map(e => ({
            merchant_id: e.merchant_id,
            merchant_name: profMap.get(e.merchant_id) ?? null,
            permissions: { ...EMPTY_PERMS, ...((e.permissions as any) || {}) },
          }))
        );
      } catch (err) {
        console.error('[useMerchantContext] exception', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
  }, [user]);

  // Determine the effective merchant id:
  // - If activeMerchantId provided + valid, use it
  // - Else if user is merchant themselves, use user.id
  // - Else if employee for exactly 1 merchant, use that
  const effectiveAgentId = useMemo(() => {
    if (activeMerchantId) {
      if (isMerchant && activeMerchantId === user?.id) return activeMerchantId;
      if (employerMerchants.some(em => em.merchant_id === activeMerchantId)) return activeMerchantId;
      if (isAdmin) return activeMerchantId;
      return null;
    }
    if (isMerchant && user) return user.id;
    if (employerMerchants.length === 1) return employerMerchants[0].merchant_id;
    return null;
  }, [activeMerchantId, isMerchant, isAdmin, user, employerMerchants]);

  // Permissions under the effective merchant
  const permissions: MerchantPermissions = useMemo(() => {
    if (!effectiveAgentId) return EMPTY_PERMS;
    if (isAdmin) return DEFAULT_PERMS;
    if (isMerchant && effectiveAgentId === user?.id) return DEFAULT_PERMS;
    const employer = employerMerchants.find(em => em.merchant_id === effectiveAgentId);
    return employer ? employer.permissions : EMPTY_PERMS;
  }, [effectiveAgentId, isAdmin, isMerchant, user, employerMerchants]);

  const isOwnerOfActive = !!user && effectiveAgentId === user.id && isMerchant;
  const hasMerchantAccess = isMerchant || isAdmin || employerMerchants.length > 0;

  return {
    loading: loading || rolesLoading,
    isMerchant,
    isAdmin,
    employerMerchants,
    effectiveAgentId,
    permissions,
    isOwnerOfActive,
    hasMerchantAccess,
  };
}
