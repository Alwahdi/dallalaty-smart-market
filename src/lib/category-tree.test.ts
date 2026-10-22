import { describe, expect, test } from 'bun:test';
import { allowedParents, categoryPath, descendantIds } from './category-tree';

const nodes = [
  { id: 'a', title: 'أجهزة', parent_id: null },
  { id: 'b', title: 'هواتف', parent_id: 'a' },
  { id: 'c', title: 'ملحقات', parent_id: 'b' },
  { id: 'd', title: 'أغطية', parent_id: 'c' },
  { id: 'other', title: 'أثاث', parent_id: null },
];
describe('nested groups', () => {
  test('supports a group inside a group across multiple levels', () => {
    expect(categoryPath(nodes, 'd')).toBe('أجهزة / هواتف / ملحقات / أغطية');
    expect([...descendantIds(nodes, 'a')]).toEqual(['a', 'b', 'c', 'd']);
  });
  test('cannot parent a group under itself or any descendant', () => {
    expect(allowedParents(nodes, 'b').map(node => node.id)).toEqual(['a', 'other']);
  });
  test('new groups may be nested under any existing depth', () => {
    expect(allowedParents(nodes).map(node => node.id)).toContain('d');
  });
});