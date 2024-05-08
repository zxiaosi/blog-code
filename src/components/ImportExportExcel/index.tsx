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
 * 参考文档
 * - FortuneSheet https://ruilisi.github.io/fortune-sheet-docs/zh/
 * - ExcelJS https://github.com/exceljs/exceljs/tree/master
 *
 * 导入Excel
 * - 问题1: 列宽和行高改变时会影响图片的位置
 * - 问题2: excelJS 获取不到工作表内的超链接
 * - 问题3: fortune-sheet 数字格式(百分比、货币等)不生效
 * - 问题4: fortune-sheet 斜线边框方法不生效
 *
 * 导出Excel
 * - 问题1: 列宽和行高改变时会影响图片的位置
 * - 问题2: excelJs 没有 filter 参数
 */
const ImportExportExcel = () => {
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

export default ImportExportExcel;
