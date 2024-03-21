import { Button } from "antd";
import React, { useRef, useState, DragEvent, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import styles from "./index.module.less";
import { CloseOutlined } from "@ant-design/icons";

interface CommonDragRef {
  show?: () => void;
  hidden?: () => void;
}

interface CommonDragProps {
  /** 标题 */
  title: string;
  /** 关闭事件 */
  onCancel?: () => void;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 一个可拖拽的Modal对话框(边界问题处理有问题)
 *
 * Ant Design: https://ant-design.antgroup.com/components/modal-cn#components-modal-demo-modal-render
 */
const DragModal = forwardRef((props: CommonDragProps, ref) => {
  const { title, onCancel, children } = props;

  const modalRef = useRef<HTMLDivElement>(null); // modal的ref

  const offsetRef = useRef({ x: 0, y: 0 }); // 偏移量

  const [isShow, setIsShow] = useState(false); // 是否显示组件

  const [position, setPosition] = useState({ x: -9999, y: -9999 }); // 组件位置初始位置

  /** 打开事件 */
  const handleOpen = () => {
    setIsShow(true);
    setTimeout(() => {
      const parentRect = document.body.getBoundingClientRect(); // 获取父元素（document.body）的信息
      if (!parentRect) return;

      // 计算模态框的位置，使其位于父元素的中心位置
      const modalRect = modalRef.current?.getBoundingClientRect();
      if (!modalRect) return;

      const x = (parentRect.width - modalRect.width) / 2;
      const y = (parentRect.height - modalRect.height) / 2;

      // 设置初始位置
      setPosition({ x, y });
    }, 100);
  };

  /** 关闭事件 */
  const handleClose = () => {
    setIsShow(false);
    onCancel?.();
    setPosition({ x: -9999, y: -9999 });
  };

  /** 拖拽开始事件 */
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", ""); // 设置拖动数据（这里用 text/plain 可以防止 Firefox 默认打开 URL）
    const rect = e.currentTarget.getBoundingClientRect(); // 获取当前元素的信息
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  /** 拖拽事件 */
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    // 获取父级div的信息（这里使用document.body）
    const parentRect = document.body.getBoundingClientRect();
    if (!parentRect) return;

    // 计算新的位置 - 当前鼠标位置 - 父元素的位置 - 起始位置
    const newX = e.clientX - parentRect.left - offsetRef.current.x;
    const newY = e.clientY - parentRect.top - offsetRef.current.y;

    // 检查是否超出父级div的边界 - 父元素的宽度 - 组件的宽度
    const maxX = parentRect.width - e.currentTarget.offsetWidth;
    const maxY = parentRect.height - e.currentTarget.offsetHeight;

    // 设置新的位置
    setPosition({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) });
  };

  /** 拖拽放置事件 */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // 阻止默认行为，避免闪现回去的情况
  };

  /** 暴露给父组件的方法 */
  useImperativeHandle(ref, () => ({
    show: handleOpen,
    hidden: handleClose,
  }));

  return (
    isShow &&
    createPortal(
      <div className={styles.portal}>
        {/* 遮罩层 */}
        <div className={styles.mask}></div>

        {/* modal */}
        <div
          ref={modalRef}
          className={styles.modal}
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          draggable="true"
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragOver={handleDragOver}>
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.title}>{title}</div>
              <div className={styles.close} onClick={handleClose}>
                <CloseOutlined />
              </div>
            </div>

            <div className={styles.body}>{children}</div>

            <div className={styles.footer}>
              <Button onClick={handleClose}>取消</Button>
              <Button type="primary" onClick={handleClose}>
                确定
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  );
});

/** 简单实现一个拖拽组件 */
const CustomDragModal = () => {
  const commonDragRef = useRef<CommonDragRef>();

  /** 打开拖拽组件 */
  const handleOpen = () => {
    commonDragRef.current?.show?.();
  };

  return (
    <div className={styles.page}>
      <Button type="primary" onClick={handleOpen}>
        打开拖拽组件
      </Button>

      <DragModal ref={commonDragRef} title={"Draggable Modal"}>
        <div>Just don't learn physics at school and your life will be full of magic and miracles. </div>
        <br />
        <div>Day before yesterday I saw a rabbit, and yesterday a deer, and today, you.</div>
      </DragModal>
    </div>
  );
};

export default CustomDragModal;
