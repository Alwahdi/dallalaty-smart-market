export interface CategoryNode {
  id: string;
  title: string;
  parent_id?: string | null;
  slug?: string;
}

export function categoryPath(nodes: CategoryNode[], id: string): string {
  const path: string[] = [];
  const visited = new Set<string>();
  let current = nodes.find(node => node.id === id);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current.title);
    current = nodes.find(node => node.id === current?.parent_id);
  }
  return path.join(' / ');
}

export function descendantIds(nodes: CategoryNode[], id: string): Set<string> {
  const result = new Set([id]);
  const queue = [id];
  while (queue.length) {
    const parent = queue.shift();
    for (const node of nodes) {
      if (node.parent_id === parent && !result.has(node.id)) {
        result.add(node.id);
        queue.push(node.id);
      }
    }
  }
  return result;
}

export function allowedParents<T extends CategoryNode>(nodes: T[], editingId?: string): T[] {
  const excluded = editingId ? descendantIds(nodes, editingId) : new Set<string>();
  return nodes.filter(node => !excluded.has(node.id));
}