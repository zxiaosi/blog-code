import type { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useState } from "react";
import { NewLine } from "./NewLine";
import { Props as TreeItemProps, TreeItem } from "./TreeItem";

interface Props extends TreeItemProps {
  /** id */
  id: UniqueIdentifier;
  /** 层级 */
  depth: number;
  /** 展开图标是否展开 */
  collapsed?: boolean;
  /** 展开事件 */
  onCollapse?: () => void;
  /** 缩进宽度 - 子列表的左偏移 */
  indentationWidth: number;
}

/** 动画布局更改 */
const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) => (isSorting || wasDragging ? false : true);

/** 可排序树形项目 */
export function SortableTreeItem({ id, depth, collapsed, onCollapse, indentationWidth, ...props }: Props) {
  const { attributes, isDragging, isSorting, listeners, setDraggableNodeRef, setDroppableNodeRef, transform, transition } = useSortable({ id, animateLayoutChanges });

  const [isAddFolder, setIsAddFolder] = useState(false); // 是否添加文件夹

  const [isEditFolder, setIsEditFolder] = useState(false); // 是否编辑文件夹

  /** 添加子文件夹 - 点击事件 */
  const handleAddFolder = () => {
    if (collapsed) onCollapse?.(); // 展开文件夹
    setIsAddFolder(true);
  };

  /** 编辑文件夹 - 点击事件 */
  const handleEditFolder = () => {
    setIsEditFolder(true);
  };

  /** 样式 */
  const treeItemStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <>
      {!isEditFolder && (
        <>
          <TreeItem
            ref={setDraggableNodeRef} // 拖拽节点
            wrapperRef={setDroppableNodeRef} // 放置节点
            depth={depth} // 层级
            ghost={isDragging} // 是否拖拽
            style={treeItemStyle} // 样式
            disableInteraction={isSorting} // 是否禁用交互
            indentationWidth={indentationWidth} // 缩进宽度
            handleProps={{ ...attributes, ...listeners }} // 拖拽事件
            collapsed={collapsed} // 是否展开
            onAddFunc={handleAddFolder} // 添加文件夹事件
            onEditFunc={handleEditFolder} // 编辑文件夹事件
            onCollapse={isAddFolder ? () => {} : onCollapse} // 展开事件
            {...props}
          />

          {/* 添加文件夹 */}
          <NewLine isShow={isAddFolder} parentId={Number(id)} setIsShow={setIsAddFolder} customStyle={{ paddingLeft: indentationWidth * (depth + 1) }} />
        </>
      )}

      {/* 编辑文件夹 */}
      {isEditFolder && <NewLine isShow={isEditFolder} setIsShow={setIsEditFolder} customStyle={{ paddingLeft: indentationWidth * depth }} currentObj={{ id: Number(id), text: props.value }} />}
    </>
  );
}
