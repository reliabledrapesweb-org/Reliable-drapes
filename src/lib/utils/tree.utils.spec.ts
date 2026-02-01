import { describe, expect, test } from "vitest";
import {
  buildTree,
  flattenTree,
  getDescendantIds,
  getAncestorIds,
  wouldCreateCircularReference,
  type TreeNode,
} from "./tree.utils";

interface TestNode extends TreeNode {
  name: string;
  level?: number;
  children?: TestNode[];
}

describe("buildTree", () => {
  test("returns empty array for empty input", () => {
    expect(buildTree([])).toEqual([]);
  });

  test("returns single node as root when no parent", () => {
    const nodes: TestNode[] = [{ id: "1", name: "Root", parent_id: null }];
    const result = buildTree(nodes);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
    expect(result[0].level).toBe(0);
    expect(result[0].children).toEqual([]);
  });

  test("nests child nodes under parent", () => {
    const nodes: TestNode[] = [
      { id: "1", name: "Parent", parent_id: null },
      { id: "2", name: "Child", parent_id: "1" },
    ];
    const result = buildTree(nodes);

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].id).toBe("2");
    expect(result[0].children?.[0].level).toBe(1);
  });

  test("handles multiple root nodes", () => {
    const nodes: TestNode[] = [
      { id: "1", name: "Root1", parent_id: null },
      { id: "2", name: "Root2", parent_id: null },
    ];
    const result = buildTree(nodes);

    expect(result).toHaveLength(2);
  });

  test("handles deeply nested nodes", () => {
    const nodes: TestNode[] = [
      { id: "1", name: "Level0", parent_id: null },
      { id: "2", name: "Level1", parent_id: "1" },
      { id: "3", name: "Level2", parent_id: "2" },
    ];
    const result = buildTree(nodes);

    expect(result[0].children?.[0].children?.[0].id).toBe("3");
    expect(result[0].children?.[0].children?.[0].level).toBe(2);
  });
});

describe("flattenTree", () => {
  test("returns empty array for empty input", () => {
    expect(flattenTree([])).toEqual([]);
  });

  test("flattens single level tree", () => {
    const tree = [{ id: "1", name: "Root", level: 0 }];
    const result = flattenTree(tree);

    expect(result).toEqual([{ id: "1", name: "Root", level: 0 }]);
  });

  test("flattens nested tree in order", () => {
    type Node = { id: string; name: string; level?: number; children?: Node[] };
    const tree: Node[] = [
      {
        id: "1",
        name: "Parent",
        level: 0,
        children: [
          { id: "2", name: "Child1", level: 1 },
          { id: "3", name: "Child2", level: 1 },
        ],
      },
    ];
    const result = flattenTree(tree);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
    expect(result[2].id).toBe("3");
  });

  test("excludes specified node ID", () => {
    const tree = [
      { id: "1", name: "Node1", level: 0 },
      { id: "2", name: "Node2", level: 0 },
    ];
    const result = flattenTree(tree, "1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});

describe("getDescendantIds", () => {
  test("returns only node ID when no children", () => {
    const tree = [{ id: "1", name: "Leaf" }];
    const result = getDescendantIds(tree, "1");

    expect(result).toEqual(["1"]);
  });

  test("returns all descendant IDs including self", () => {
    type Node = { id: string; name: string; children?: Node[] };
    const child3: Node = { id: "3", name: "Grandchild" };
    const child2: Node = { id: "2", name: "Child", children: [child3] };
    const root: Node = { id: "1", name: "Root", children: [child2] };
    const tree: Node[] = [root, child2, child3];

    const result = getDescendantIds(tree, "1");

    expect(result).toContain("1");
    expect(result).toContain("2");
    expect(result).toContain("3");
    expect(result).toHaveLength(3);
  });

  test("returns empty array when node not found", () => {
    const tree = [{ id: "1", name: "Only" }];
    const result = getDescendantIds(tree, "non-existent");

    expect(result).toEqual(["non-existent"]);
  });
});

describe("getAncestorIds", () => {
  test("returns empty array for root node", () => {
    const nodes: TestNode[] = [{ id: "1", name: "Root", parent_id: null }];
    const result = getAncestorIds(nodes, "1");

    expect(result).toEqual([]);
  });

  test("returns parent chain from immediate to root", () => {
    const nodes: TestNode[] = [
      { id: "1", name: "Grandparent", parent_id: null },
      { id: "2", name: "Parent", parent_id: "1" },
      { id: "3", name: "Child", parent_id: "2" },
    ];
    const result = getAncestorIds(nodes, "3");

    expect(result).toEqual(["2", "1"]);
  });

  test("returns empty array when node not found", () => {
    const nodes: TestNode[] = [{ id: "1", name: "Only", parent_id: null }];
    const result = getAncestorIds(nodes, "non-existent");

    expect(result).toEqual([]);
  });
});

describe("wouldCreateCircularReference", () => {
  test("returns true when node tries to be its own parent", () => {
    const nodes: TestNode[] = [{ id: "1", name: "Node", parent_id: null }];
    const result = wouldCreateCircularReference(nodes, "1", "1");

    expect(result).toBe(true);
  });

  test("returns true when proposed parent is a descendant", () => {
    // Flat nodes for checking circular reference
    const nodes: TestNode[] = [
      { id: "1", name: "Parent", parent_id: null },
      { id: "2", name: "Child", parent_id: "1" },
      { id: "3", name: "Grandchild", parent_id: "2" },
    ];
    // Trying to set Grandchild (3) as parent of Parent (1) would create a cycle
    const result = wouldCreateCircularReference(nodes, "1", "3");

    expect(result).toBe(true);
  });

  test("returns false for valid parent assignment", () => {
    const nodes: TestNode[] = [
      { id: "1", name: "Root1", parent_id: null },
      { id: "2", name: "Root2", parent_id: null },
    ];
    const result = wouldCreateCircularReference(nodes, "2", "1");

    expect(result).toBe(false);
  });
});
