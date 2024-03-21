import { DndContext, useDraggable } from "@dnd-kit/core";
import { Coordinates, DragEndEvent } from "@dnd-kit/core/dist/types";
import { useEffect, useMemo, useState } from "react";
import { restrictToParentElement, restrictToWindowEdges } from "@dnd-kit/modifiers";
import styles from "./index.module.less";
import { CloseCircleOutlined } from "@ant-design/icons";
import { createPortal } from "react-dom";
import { Button, Card, Select } from "antd";

interface DraggableProps {
  top: number;
  left: number;
  style?: React.CSSProperties;
  onClose?: () => void;
}

/** 拖拽组件 */
const Draggable = (props: DraggableProps) => {
  const { top, left, style, onClose } = props;

  const [value, setValue] = useState("jack");

  const { attributes, listeners, setNodeRef, transform, setActivatorNodeRef } = useDraggable({
    id: "draggable",
  });

  /** 关闭事件 */
  const handleClose = () => {
    onClose?.();
  };

  const myStyle = transform ? { "--translate-x": `${transform?.x ?? 0}px`, "--translate-y": `${transform?.y ?? 0}px` } : undefined;

  return (
    <div id="draggable" ref={setNodeRef} style={{ ...style, ...myStyle, top, left }} className={styles.draggable}>
      <button ref={setActivatorNodeRef} {...listeners} {...attributes} className={styles.title}>
        点我拖拽
      </button>

      {/* 示例 */}
      <div className={styles.body}>
        <Card className={styles.card}>
          <Select
            style={{ width: "100%" }}
            options={[
              { value: "jack", label: "Jack" },
              { value: "lucy", label: "Lucy" },
              { value: "Yiminghe", label: "yiminghe" },
              { value: "disabled", label: "Disabled", disabled: true },
            ]}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Card>
      </div>

      <div className={styles.closeIcon} onClick={handleClose}>
        <CloseCircleOutlined />
      </div>
    </div>
  );
};

/** 使用dnd-kit简单实现拖拽组件 */
const CustomDndkit = () => {
  const [isShow, setIsShow] = useState(true); // 是否显示弹框

  // const [{ x, y }, setCoordinates] = useState<Coordinates>({ x: 0, y: 0 }); // 初始位置
  const [{ x, y }, setCoordinates] = useState<Coordinates>({ x: -9999, y: -9999 }); // 初始位置（默认隐藏）

  const [type, setType] = useState<"drag" | "modal" | "modalMask">("drag"); // 弹框类型

  /** 设置初始位置 */
  const initCoordinates = () => {
    setCoordinates(() => ({ x: -9999, y: -9999 })); // 隐藏弹框

    setTimeout(() => {
      const dragEl = document.getElementById("draggable");
      if (!dragEl) return;
      const parentEl = dragEl?.parentElement?.getBoundingClientRect();
      if (!parentEl) return;

      // 居中
      const newX = parentEl.width / 2 - dragEl.clientWidth / 2;
      const newY = parentEl.height / 2 - dragEl.clientHeight / 2;
      setCoordinates(() => ({ x: newX, y: newY }));
    }, 200);
  };

  /** 拖拽结束事件 */
  const handleDragEnd = ({ delta }: DragEndEvent) => {
    setCoordinates(({ x, y }) => ({ x: x + delta.x, y: y + delta.y }));
  };

  /** 切换弹框类型 */
  const handleTypeChange = (type: "drag" | "modal" | "modalMask") => {
    setType(type);
    if (!isShow) setIsShow(true);
    initCoordinates(); // 重新设置位置
  };

  /** 关闭弹框 */
  const handleClose = () => {
    setIsShow(false);
  };

  /** 初始化位置 */
  useEffect(() => {
    initCoordinates();
  }, []);

  /** 子组件 */
  const childComponent = useMemo(() => {
    switch (type) {
      case "drag":
        return (
          isShow && (
            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
              <Draggable top={y} left={x} onClose={handleClose} style={{ position: "relative" }} />
            </DndContext>
          )
        );
      case "modal":
        return (
          isShow &&
          createPortal(
            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
              <Draggable top={y} left={x} onClose={handleClose} style={{ position: "absolute" }} />
            </DndContext>,
            document.getElementById("root") as HTMLElement
          )
        );
      case "modalMask":
        return (
          isShow &&
          createPortal(
            <div className={styles.portal}>
              <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
                <Draggable top={y} left={x} onClose={handleClose} style={{ position: "absolute" }} />
              </DndContext>
            </div>,
            document.body
          )
        );
    }
  }, [isShow, type, x, y]);

  return (
    <div className={styles.page}>
      <div className={styles.btn}>
        <Button type="primary" onClick={() => handleTypeChange("drag")}>
          限定在父元素内拖动
        </Button>

        <Button type="primary" onClick={() => handleTypeChange("modal")}>
          不带遮罩层的modal
        </Button>

        <Button type="primary" onClick={() => handleTypeChange("modalMask")}>
          带遮罩层的modal
        </Button>
      </div>

      <div className={styles.content}>{childComponent}</div>
    </div>
  );
};

export default CustomDndkit;
