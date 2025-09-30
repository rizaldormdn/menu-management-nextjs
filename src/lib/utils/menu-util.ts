import type { MenuItem } from "../store/slice/menuSlice";

export function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>();
  const rootItems: MenuItem[] = [];

  // Create a map of all items
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Build the tree structure
  items.forEach((item) => {
    const menuItem = itemMap.get(item.id)!;

    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(menuItem);
    } else {
      rootItems.push(menuItem);
    }
  });

  // Sort items by order
  const sortByOrder = (items: MenuItem[]) => {
    items.sort((a, b) => a.order - b.order);
    items.forEach((item) => {
      if (item.children) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(rootItems);
  return rootItems;
}

export function flattenMenuTree(items: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];

  const flatten = (items: MenuItem[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children) {
        flatten(item.children);
      }
    });
  };

  flatten(items);
  return result;
}

export function findMenuItemById(
  items: MenuItem[],
  id: string
): MenuItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getMenuItemPath(items: MenuItem[], targetId: string): string[] {
  const path: string[] = [];

  const findPath = (items: MenuItem[], currentPath: string[]): boolean => {
    for (const item of items) {
      const newPath = [...currentPath, item.name];

      if (item.id === targetId) {
        path.push(...newPath);
        return true;
      }

      if (item.children && findPath(item.children, newPath)) {
        return true;
      }
    }
    return false;
  };

  findPath(items, []);
  return path;
}
