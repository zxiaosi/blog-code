import classNames from "classnames";
import React, { forwardRef, HTMLAttributes } from "react";

import { DownOutlined, HolderOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import styles from "./TreeItem.module.less";

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
  /** 子元素数量 - 用于拖动元素显示 */
  childCount?: number;
  /** 是否拖动中元素 */
  clone?: boolean;
  /** 展开图标是否展开 */
  collapsed?: boolean;
  /** 层级 */
  depth: number;
  /** 是否禁用交互 */
  disableInteraction?: boolean;
  /** 是否拖动中元素 */
  ghost?: boolean;
  /** 拖动元素的属性 */
  handleProps?: any;
  /** 是否显示指示器 - 拖动元素时显示的蓝色显示条 */
  indicator?: boolean;
  /** 缩进宽度 - 子列表的左偏移 */
  indentationWidth: number;
  /** 显示的值 */
  value: string;
  /** 展开事件 */
  onCollapse?(): void;
  /** 删除事件 */
  onRemove?(): void;
  /** 放置节点 */
  wrapperRef?(node: HTMLLIElement): void;
  /** 添加子文件夹事件 */
  onAddFunc?: () => void;
  /** 编辑子文件夹事件 */
  onEditFunc?: () => void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    { childCount, clone, depth, disableInteraction, ghost, handleProps, indentationWidth, indicator, collapsed, onCollapse, onRemove, style, value, wrapperRef, onAddFunc, onEditFunc, ...props },
    ref
  ) => {
    return (
      <li
        ref={wrapperRef}
        className={classNames(styles.Wrapper, clone && styles.clone, ghost && styles.ghost, indicator && styles.indicator, disableInteraction && styles.disableInteraction)}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`, // 缩进宽度
            // 指示器的位置修改
            ...(ghost && {
              width: `calc(100% - ${indentationWidth}px)`,
              left: `${indentationWidth}px`,
            }),
          } as React.CSSProperties
        }
        {...props}>
        <div className={styles.TreeItem} ref={ref} style={style}>
          {/* clone - 拖动中元素 | !clone - 列表显示*/}

          {/* 拖动图标 */}
          {!clone && <HolderOutlined style={{ touchAction: "none", cursor: "move", marginRight: 8 }} {...handleProps} />}

          {/* 展开图标 */}
          {onCollapse && <DownOutlined onClick={onCollapse} className={classNames(styles.Collapse, collapsed && styles.collapsed)} />}

          {/* 文案 */}
          <span className={styles.Text}>{value}</span>

          {/* 操作栏 */}
          {!clone && (
            <div className={styles.operation}>
              <div onClick={onAddFunc}>添加子文件夹</div>
              <div onClick={onEditFunc}>编辑</div>
              <Popconfirm title="确定删除吗？" onConfirm={onRemove}>
                <div>删除</div>
              </Popconfirm>
            </div>
          )}

          {/* 拖动中元素 */}
          {clone && childCount && childCount > 1 ? <span className={styles.Count}>{childCount}</span> : null}
        </div>
      </li>
    );
  }
);
