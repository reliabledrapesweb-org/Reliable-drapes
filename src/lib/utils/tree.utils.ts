/**
 * Generic tree utility functions for hierarchical data structures
 * Works with any entity that has an id and parent_id
 */

/**
 * Interface for entities that can be organized in a tree structure
 */
export interface TreeNode {
  id: string;
  parent_id: string | null;
}

/**
 * Build a tree structure from flat nodes
 * @param nodes - Flat array of nodes with id and parent_id
 * @param parentId - Parent ID to start building from (null for root)
 * @param level - Current depth level (for internal recursion)
 * @returns Array of nodes with children property added
 */
export function buildTree<T extends TreeNode>(
  nodes: T[],
  parentId: string | null = null,
  level = 0,
): Array<T & { children?: T[]; level?: number }> {
  return nodes
    .filter((node) => node.parent_id === parentId)
    .map((node) => ({
      ...node,
      level,
      children: buildTree(nodes, node.id, level + 1),
    }));
}

/**
 * Flatten a tree to array with indentation info for dropdowns
 * @param tree - Tree structure to flatten
 * @param excludeId - Optional ID to exclude from result (e.g., to prevent selecting self as parent)
 * @returns Array of {id, name, level} for dropdown rendering
 */
export function flattenTree<
  T extends { id: string; name: string; children?: T[]; level?: number },
>(
  tree: T[],
  excludeId?: string,
): Array<{ id: string; name: string; level: number }> {
  const result: Array<{ id: string; name: string; level: number }> = [];

  function traverse(nodes: T[]) {
    for (const node of nodes) {
      if (node.id !== excludeId) {
        result.push({ id: node.id, name: node.name, level: node.level || 0 });
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    }
  }

  traverse(tree);
  return result;
}

/**
 * Get all descendant IDs of a node (including the node itself)
 * @param nodes - Tree nodes with children property
 * @param nodeId - ID of the node to get descendants for
 * @returns Array of IDs including the node and all descendants
 */
export function getDescendantIds<T extends { id: string; children?: T[] }>(
  nodes: T[],
  nodeId: string,
): string[] {
  // Search for the node in the current tree level
  for (const node of nodes) {
    if (node.id === nodeId) {
      // Found the node, collect all descendants
      const result: string[] = [nodeId];
      if (node.children) {
        for (const child of node.children) {
          result.push(...getDescendantIds(node.children, child.id));
        }
      }
      return result;
    }
    // Search in children
    if (node.children) {
      const result = getDescendantIds(node.children, nodeId);
      if (result.length > 1 || (result.length === 1 && result[0] !== nodeId)) {
        return result;
      }
    }
  }

  // Node not found, return just the ID
  return [nodeId];
}

/**
 * Get all ancestor IDs of a node (parent, grandparent, etc.)
 * @param nodes - Flat array of nodes with id and parent_id
 * @param nodeId - ID of the node to get ancestors for
 * @returns Array of parent IDs from immediate parent to root
 */
export function getAncestorIds<T extends TreeNode>(
  nodes: T[],
  nodeId: string,
): string[] {
  const result: string[] = [];
  let currentId: string | null = nodeId;

  while (currentId !== null) {
    const node = nodes.find((n) => n.id === currentId);
    if (node?.parent_id) {
      result.push(node.parent_id);
      currentId = node.parent_id;
    } else {
      currentId = null;
    }
  }

  return result;
}

/**
 * Check if adding a parent would create a circular reference
 * @param nodes - Flat array of all nodes
 * @param nodeId - ID of the node being updated
 * @param proposedParentId - ID of the proposed parent
 * @returns true if circular reference would be created
 */
export function wouldCreateCircularReference<T extends TreeNode>(
  nodes: T[],
  nodeId: string,
  proposedParentId: string,
): boolean {
  // Can't be your own parent
  if (nodeId === proposedParentId) return true;

  // Check if proposed parent is a descendant of the node
  const tree = buildTree(nodes);
  const descendantIds = getDescendantIds(tree, nodeId);
  return descendantIds.includes(proposedParentId);
}
