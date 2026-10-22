import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.equal(categoryPath(nodes, 'd'), 'أجهزة / هواتف / ملحقات / أغطية');
    assert.deepEqual([...descendantIds(nodes, 'a')], ['a', 'b', 'c', 'd']);
  });
  test('cannot parent a group under itself or any descendant', () => {
    assert.deepEqual(allowedParents(nodes, 'b').map(node => node.id), ['a', 'other']);
  });
  test('new groups may be nested under any existing depth', () => {
    assert.ok(allowedParents(nodes).some(node => node.id === 'd'));
  });
});