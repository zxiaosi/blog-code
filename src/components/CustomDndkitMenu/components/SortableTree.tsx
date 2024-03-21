import { closestCenter, DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, DragOverlay, DragStartEvent, MeasuringStrategy, Modifier, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { message } from "antd";
import { SortableTreeItem } from "./components/SortableTreeItem";
import { FlattenedItem } from "./types";
import { flattenTree, getChildCount, getProjection, removeChildrenOf, setProperty } from "./utils";
import { ApisContext } from "./context";

/** 调整平移 */
const adjustTranslate: Modifier = ({ transform }) => {
  return { ...transform, y: transform.y - 25 };
};

interface Props {
  /** 是否显示展开按钮 */
  collapsible?: boolean;
  /** 缩进宽度 - 子列表的左偏移 */
  indentationWidth?: number;
  /** 是否显示指示器 - 拖动元素时显示的蓝色显示条 */
  indicator?: boolean;
  /** 是否显示删除按钮 */
  removable?: boolean;
}

/**
 * 定制树形拖拽排序
 * 工具库: https://dndkit.com/
 * 示例：https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/?path=/docs/examples-tree-sortable--all-features
 * Github 源码 https://github.com/clauderic/dnd-kit/tree/master/stories/3%20-%20Examples/Tree
 */
export function SortableTree({ collapsible, indicator = false, indentationWidth = 50, removable }: Props) {
  const { getDatasApi, deleteDataApi, dragDataApi } = useContext(ApisContext);

  const [treeData, setTreeData] = useState<any[]>([]); // 菜单数据

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null); // 当前拖动的id

  const [overId, setOverId] = useState<UniqueIdentifier | null>(null); // 当前悬停的id

  const [offsetLeft, setOffsetLeft] = useState(0); // 左偏移

  const collapseds = useRef<any[]>([]); // 展开的元素id集合

  /** 初始化数据 */
  useEffect(() => setTreeData(getDatasApi?.() || []), [getDatasApi]);

  /** 扁平化数据 - 展开的数据项集合 */
  const flattenedItems = useMemo(() => {
    /** 加工数据 */
    const flattenedTree = flattenTree(treeData || []);

    /** 展开的数据项集合 */
    const collapsedItems = flattenedTree.reduce<any[]>((acc, { collapsed, id }) => {
      /**
       * 是否展开 true: 折叠 false: 展开
       * 1. expandIds为空时，全部折叠
       * 2. expandIds不为空时，expandIds中包含当前id时，折叠
       */
      const isCollapsed = collapseds.current.length === 0 || collapseds.current.includes(Number(id));

      return collapsed && isCollapsed ? [...acc, id] : acc;
    }, []);

    // 保存展开的元素id集合
    collapseds.current = collapsedItems;

    return removeChildrenOf(flattenedTree, activeId ? [activeId, ...collapsedItems] : collapsedItems);
  }, [activeId, treeData]);

  /** 获取父元素信息 */
  const projected = activeId && overId ? getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth) : null;

  /** 排序后的元素id集合 */
  const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);

  /** 拖动中的元素信息 */
  const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null;

  /** 刷新状态 */
  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.style.setProperty("cursor", "");
  }

  /** 拖拽开始事件 */
  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId); // 设置当前拖动的id
    setOverId(activeId); // 设置当前悬停的id

    document.body.style.setProperty("cursor", "grabbing"); // 设置鼠标样式
  }

  /** 拖动中事件 */
  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x); // 设置左偏移
  }

  /** 拖拽到一个元素范围事件 */
  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null); // 设置当前悬停的id
  }

  /** 拖拽结束事件 */
  async function handleDragEnd({ active, over }: DragEndEvent) {
    resetState(); // 刷新状态

    if (projected && over) {
      const { depth, parentId } = projected; // 拖动元素的深度和父元素id
      const flattenedTree = flattenTree(treeData || []); // 扁平化数据
      const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenedTree)); // 深拷贝
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id); // 悬停元素的索引
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id); // 拖动元素的索引
      const activeTreeItem = clonedItems[activeIndex]; // 拖动元素信息

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId }; // 设置拖动元素的深度和父元素id

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex); // 排序后的元素集合

      // 获取当前父元素下的所有子元素id集合
      const ids = sortedItems.reduce((prev: any, curr) => {
        return curr.parentId === parentId ? [...prev, curr.id] : prev;
      }, []);

      dragDataApi?.({ parentId: Number(parentId || -1), ids });
      message.success("操作成功");
      getDatasApi?.();

      // const newItems = buildTree(sortedItems);
      // setItems(newItems);
    }
  }

  /** 拖拽返回事件 */
  function handleDragCancel() {
    resetState(); // 刷新状态
  }

  /** 删除事件 */
  function handleRemove(id: UniqueIdentifier) {
    deleteDataApi?.(Number(id)); // 删除数据
    message.success("操作成功"); // 提示
    getDatasApi?.(); // 设置数据列表
  }

  /** 展开/收起事件 */
  function handleCollapse(id: UniqueIdentifier) {
    setTreeData((items) =>
      setProperty(items, id, "collapsed", (value) => {
        console.log("value", collapseds.current, id, value);

        if (collapseds.current.includes(Number(id))) {
          collapseds.current = collapseds.current.filter((item: any) => item !== Number(id));
          return false;
        } else {
          collapseds.current.push(Number(id));
          return true;
        }
      })
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter} // 碰撞检测
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} // 开启测量
      onDragStart={handleDragStart} // 拖拽开始事件
      onDragMove={handleDragMove} // 拖动中事件
      onDragOver={handleDragOver} // 拖拽到一个元素范围事件
      onDragEnd={handleDragEnd} // 拖拽结束事件
      onDragCancel={handleDragCancel} // 拖拽返回事件
    >
      <SortableContext
        items={sortedIds} // 排序后的元素id集合
        strategy={verticalListSortingStrategy} // 垂直列表策略
      >
        {/* 列表 */}
        {flattenedItems.map(({ id, name, children, collapsed, depth }) => (
          <SortableTreeItem
            key={id} // 唯一标识
            id={id} // 元素id
            value={name || "-"} // 元素值(展示到页面上的值)
            depth={id === activeId && projected ? projected.depth : depth} // 深度
            indentationWidth={indentationWidth} // 缩进宽度
            indicator={indicator} // 是否显示指示器
            collapsed={Boolean(collapsed && children?.length && collapseds.current.includes(id))} // 是否折叠
            onCollapse={collapsible && children?.length ? () => handleCollapse(id) : undefined} // 展开/收起事件
            onRemove={removable ? () => handleRemove(id) : undefined} // 删除事件
          />
        ))}

        {/* 拖动中的元素 */}
        {createPortal(
          <DragOverlay modifiers={indicator ? [adjustTranslate] : undefined}>
            {activeId && activeItem ? (
              <SortableTreeItem
                id={activeId} // 当前拖动的id
                depth={activeItem.depth} // 深度
                clone // 是否克隆
                childCount={getChildCount(treeData, activeId) + 1} // 子元素数量
                value={activeItem.name || "-"} // 元素值(展示到页面上的值)
                indentationWidth={indentationWidth} // 缩进宽度
                style={{ background: "rgba(24,144,255,0.8)", color: "#fff" }} // 样式
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );
}
