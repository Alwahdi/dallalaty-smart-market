import { describe, expect, it } from 'vitest';
import { hasMerchantCapability } from '../src/lib/role-access';

describe('Merchant dashboard access', () => {
  it('gives the platform administrator merchant capabilities without a merchant role', () => {
    expect(hasMerchantCapability(['admin'])).toBe(true);
  });
  it('preserves merchant access', () => {
    expect(hasMerchantCapability(['merchant'])).toBe(true);
  });
  it('does not give customers or area managers merchant capabilities', () => {
    for (const roles of [[], ['user'], ['properties_admin'], ['categories_admin'], ['notifications_admin'], ['moderator']]) {
      expect(hasMerchantCapability(roles)).toBe(false);
    }
  });
});