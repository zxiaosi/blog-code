import { HolderOutlined } from "@ant-design/icons";
import { Input, message } from "antd";
import { useContext, useState } from "react";
import styles from "./NewLine.module.less";
import { ApisContext } from "../context";
import React from "react";

interface CurrentObjType {
  id: number;
  text?: string;
}

interface Props {
  /** 是否显示新行 */
  isShow: boolean;

  /** 当前文件夹对象 */
  currentObj?: CurrentObjType;

  /** 父文件夹Id */
  parentId?: number;

  /** 自定义style */
  customStyle?: React.CSSProperties;

  /** 设置是否显示 */
  setIsShow: (isShow: boolean) => void;
}

/** 新建文件夹输入框 */
export const NewLine = React.memo((props: Props) => {
  const { getDatasApi, createDataApi, updateDataApi } = useContext(ApisContext);

  const { isShow, currentObj, parentId = -1, customStyle, setIsShow } = props;

  const [inputValue, setInputValue] = useState(currentObj?.text || ""); // 输入框值

  const [messageApi, contextHolder] = message.useMessage();

  /** 添加输入框 - 成功事件 */
  const handleSuccess = () => {
    messageApi.success("操作成功");
    getDatasApi?.();
  };

  /** 添加输入框 - 输入事件 */
  const handleInputVal = (e: any) => {
    setInputValue(e.target.value);
  };

  /** 添加输入框 - Blur事件 */
  const handleInputBlur = () => {
    setIsShow(false);

    if (!inputValue) return messageApi.error("文件夹名不能为空");

    if (currentObj) {
      updateDataApi?.({ id: currentObj?.id, name: inputValue });
    } else {
      createDataApi?.({ name: inputValue, parentId: parentId });
    }
    handleSuccess();
    setInputValue("");
  };

  /** 添加输入框 - 键盘按下事件 */
  const handleInputKeyDown = (e: any) => {
    if (e.keyCode === 13) handleInputBlur();
  };

  return (
    <>
      {isShow ? (
        <div className={styles.content} style={customStyle}>
          <HolderOutlined className={styles.icon} />

          <Input
            ref={function (input) {
              // 自动聚焦
              if (input !== null) input.focus();
            }}
            maxLength={50}
            value={inputValue}
            style={{ width: 400 }}
            onInput={handleInputVal}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
          />
        </div>
      ) : null}

      {contextHolder}
    </>
  );
});
