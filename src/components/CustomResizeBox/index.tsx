import { useState, MouseEvent } from 'react';
import { Avatar } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import avatar from '../../assets/react.svg';

/** 菜单列表 */
const menuList = Array.from({ length: 23 }).map((_, i) => ({
  id: i,
  title: `ant design part ${i}`,
  avatar: avatar,
  description:
    'Ant Design, a design language for background applications, is refined by Ant UED Team.',
}));

/**
 * 简单实现一个可伸缩侧边栏
 *
 * 仿照字节跳动UI的可伸缩侧边栏: https://arco.design/react/components/layout#%E5%8F%AF%E4%BC%B8%E7%BC%A9%E4%BE%A7%E8%BE%B9%E6%A0%8F
 *
 * 参考: https://juejin.cn/post/6992833914104463367
 */
const CustomResizeBox = () => {
  const [siderWidth, setSiderWidth] = useState(300); // 左侧内容宽度

  const [dragging, setDragging] = useState(false); // 是否正在拖动

  const [startPageX, setStartPageX] = useState(0); // 开始拖动时的鼠标位置

  const [selectDetail, setDetailDetail] = useState<any>({}); // 选中的菜单项

  /** 鼠标按下事件 */
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    setStartPageX(event.pageX);
    setDragging(true);
  };

  /** 鼠标移动事件 */
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    // 计算当前宽度
    const currentSiderWidth = siderWidth + event.pageX - startPageX;
    // 移动偏移量在300~500之间
    const newSideWidth = Math.max(300, Math.min(800, currentSiderWidth));
    // 设置新的宽度
    setSiderWidth(newSideWidth);
    // 记录当前x位置, 用于下次拖动使用
    setStartPageX(event.pageX);
  };

  /** 鼠标抬起事件 */
  const handleMouseUp = () => {
    setDragging(false);
  };

  /** 点击菜单项 */
  const handleClickItem = (record: any) => {
    setDetailDetail(record);
  };

  return (
    <div className={styles.page}>
      <div
        className={styles.leftContent}
        style={{ width: siderWidth, minWidth: 300, maxWidth: 800 }}
      >
        <div className={styles.menuContent}>
          <div className={styles.title}>菜单列表</div>

          <div className={styles.menuList}>
            {menuList.map((_) => {
              return (
                <div
                  key={_.id}
                  className={`${styles.menu} ${
                    _.id === selectDetail.id && styles.active
                  }`}
                  onClick={() => handleClickItem(_)}
                >
                  <div className={styles.left}>
                    <Avatar src={_.avatar} />
                  </div>

                  <div className={styles.right}>
                    <div className={styles.itemTitle}>{_.title}</div>
                    <div className={styles.itemDesc}>{_.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={styles.dragHandle}
          onMouseDown={handleMouseDown}
          style={{ left: siderWidth }}
        >
          <HolderOutlined className={styles.icon} />

          {/* 当拖拽开始后, 为整个页面添加遮罩层, 以及鼠标相关事件 */}
          {dragging && (
            <div
              className={styles.mask}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            ></div>
          )}
        </div>
      </div>

      <div className={styles.rightContent}>
        <div>{selectDetail.title}</div>
        <div>{selectDetail.title}</div>
        <div>{selectDetail.title}</div>
        <div>{selectDetail.description}</div>
        <div>{selectDetail.description}</div>
        <div>{selectDetail.description}</div>
      </div>
    </div>
  );
};

export default CustomResizeBox;
