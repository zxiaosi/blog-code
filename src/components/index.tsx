import { Sheet } from "@fortune-sheet/core";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { Button, Upload, message } from "antd";
import { useCallback, useRef, useState } from "react";
import styles from "./index.module.less";
import { handleExportExcel } from "../../utils/exportExcel";
import { RcFile } from "antd/es/upload";
import { handleImportExcel } from "../../utils/importExcel";

/** message 全局key */
const messageKey = "messageKey";

/**
 * FortuneSheet https://ruilisi.github.io/fortune-sheet-docs/zh/
 * ExcelJS https://github.com/exceljs/exceljs/tree/master
 * @returns
 */
const ExportExcel = () => {
  const ref = useRef<WorkbookInstance>(null);

  const [excelData, setExcelData] = useState<Sheet[]>([]); // 表格数据

  const [messageApi, contextHolder] = message.useMessage();

  /** 表格改变事件 */
  const handleChange = useCallback((data: any) => {
    console.log("data", data);
    setExcelData(data);
  }, []);

  /** 上传 */
  const handleUpload = async (file: RcFile) => {
    console.log("handleUpload", file);

    // 校验文件类型
    if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      messageApi.error({ key: messageKey, content: "请上传xlsx文件！" });
      return Upload.LIST_IGNORE;
    }

    setExcelData([]); // 清空数据

    messageApi.loading({ key: messageKey, content: "上传中..." });

    const newExcelData = await handleImportExcel(file);

    if (newExcelData) {
      setExcelData(newExcelData);
      setTimeout(() => {
        // 重新构造calcChain
        ref.current?.calculateFormula();
      }, 200);
      messageApi.success({ key: messageKey, content: "上传成功！" });
    } else {
      messageApi.error({ key: messageKey, content: "上传失败！" });
    }

    return Upload.LIST_IGNORE;
  };

  /** 下载 */
  const handleDownload = async () => {
    messageApi.loading({ key: messageKey, content: "下载中..." });
    await handleExportExcel(excelData, "temp.xlsx");
    messageApi.success({ key: messageKey, content: "下载成功！" });
  };

  return (
    <>
      {contextHolder}

      <div className={styles.page}>
        <div className={styles.btnGroup}>
          <div className={styles.btn}>
            <Upload beforeUpload={handleUpload}>
              <Button type="primary">上传</Button>
            </Upload>
          </div>

          <Button className={styles.btn} onClick={handleDownload} type="primary">
            下载
          </Button>
        </div>

        <div className={styles.content}>{excelData.length > 0 && <Workbook ref={ref} lang={"zh"} data={excelData} onChange={handleChange} />}</div>
      </div>
    </>
  );
};

export default ExportExcel;
