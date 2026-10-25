/** UI capability only; authenticated Supabase policies remain authoritative. */
export function hasMerchantCapability(roles: readonly string[]): boolean {
  return roles.includes('admin') || roles.includes('merchant');
}