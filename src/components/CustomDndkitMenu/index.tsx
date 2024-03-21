import { useState } from "react";
import styles from "./index.module.less";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { MyApisContext } from "./components/context";
import { NewLine } from "./components/components";
import { SortableTree } from "./components/SortableTree";

/** 使用dnd-kit简单实现嵌套可拖动菜单 */
const CustomDndkitMenu = () => {
  const [isShowNewLine, setIsShowNewLine] = useState(false); // 是否显示新行

  /** 添加文件夹 */
  const handleAddFolder = () => {
    setIsShowNewLine(true);
  };

  return (
    <MyApisContext>
      <div className={styles.page}>
        {/* 标题、新建按钮 */}
        <div className={styles.header}>
          <div className={styles.title}>文件夹</div>

          <Button type={"primary"} icon={<PlusOutlined />} onClick={handleAddFolder}>
            新建文件夹
          </Button>
        </div>

        {/* 表格 */}
        <div className={styles.table}>
          {/* 表头 */}
          <div className={styles.tableHeader}>
            <div className={styles.folderName}>文件夹名称</div>
            <div className={styles.operation}>操作</div>
          </div>

          {/* 新建文件夹 */}
          <NewLine parentId={-1} isShow={isShowNewLine} setIsShow={setIsShowNewLine} />

          {/* 拖动排序表格 */}
          <SortableTree collapsible indicator removable indentationWidth={21} />
        </div>
      </div>
    </MyApisContext>
  );
};

export default CustomDndkitMenu;
