import type { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { FlattenedItem, TreeItem, TreeItems } from "./types";

/** 生成菜单 */
export function generateMenuItems(data: any[], parentId: number) {
  const children = data.filter((item: any) => item.parentId === parentId);

  if (children?.length === 0) return null;

  const newChildren = children?.sort((a, b) => a.idx - b.idx);

  const menuItems: any = newChildren.map((child) => {
    const submenu = generateMenuItems(data, child.id);
    return {
      id: child.id,
      name: child.name,
      idx: child.idx,
      children: submenu,
    };
  });

  return menuItems;
}

/**
 * 获取拖动的层级
 * @param offset 偏移量
 * @param indentationWidth 缩进宽度
 */
function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

/**
 * 获取最大层级
 * @param previousItem 上一个item
 */
function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  return previousItem ? previousItem.depth + 1 : 0;
}

/**
 * 获取最小层级
 * @param nextItem 下一个item
 */
function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  return nextItem ? nextItem.depth : 0;
}

/**
 * 获取父元素信息
 * @param items 数据
 * @param activeId 拖动的id
 * @param overId 拖动到的id
 * @param dragOffset 偏移量
 * @param indentationWidth 缩进宽度
 */
export function getProjection(items: FlattenedItem[], activeId: UniqueIdentifier, overId: UniqueIdentifier, dragOffset: number, indentationWidth: number) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({ previousItem });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) return -1;

    if (depth === previousItem.depth) return previousItem.parentId;

    if (depth > previousItem.depth) return previousItem.id;

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent || -1;
  }
}

/**
 * 扁平化数据
 * @param items 数据
 * @param parentId 父级id
 * @param depth 层级
 */
export function flattenTree(items: TreeItems, parentId: UniqueIdentifier | null = -1, depth = 0): FlattenedItem[] {
  if (!items) return [];

  return items?.reduce?.<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { collapsed: true, ...item, parentId, depth, index }, // 默认全部折叠
      ...flattenTree(item.children, item.id, depth + 1),
    ];
  }, []);
}

/**
 * 根据id查找item
 * @param items 数据
 * @param itemId id
 */
export function findItem(items: TreeItem[], itemId: UniqueIdentifier) {
  return items.find(({ id }) => id === itemId);
}

/**
 * 构建树
 * @param flattenedItems 数据
 */
export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root: TreeItem = { id: "root", children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children };
    parent?.children?.push(item);
  }

  return root.children;
}

/**
 * 根据id查找item - 嵌套数据
 * @param items 数据
 * @param itemId id
 */
export function findItemDeep(items: TreeItems, itemId: UniqueIdentifier): TreeItem | undefined {
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) return item;

    if (children?.length) {
      const child = findItemDeep(children, itemId);

      if (child) return child;
    }
  }

  return undefined;
}

/**
 * 根据id删除item
 * @param items 数据
 * @param itemId id
 */
export function removeItem(items: TreeItems, id: UniqueIdentifier) {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

/**
 * 根据id设置属性
 * @param items 数据
 * @param id id
 * @param property 属性
 * @param setter 设置器
 */
export function setProperty<T extends keyof TreeItem>(items: TreeItems, id: UniqueIdentifier, property: T, setter: (value: TreeItem[T]) => TreeItem[T]) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children?.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

/**
 * 统计子节点
 * @param items 数据
 * @param count 计数
 */
function countChildren(items: TreeItem[], count = 0): number {
  return items?.reduce((acc, { children }) => {
    if (children?.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

/**
 * 获取子节点数量
 * @param items 数据
 * @param id id
 */
export function getChildCount(items: TreeItems, id: UniqueIdentifier) {
  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

/**
 * 移出子节点
 * @param items 数据
 * @param ids id集合
 */
export function removeChildrenOf(items: FlattenedItem[], ids: UniqueIdentifier[]) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children?.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}
