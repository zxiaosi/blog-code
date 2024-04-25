import { Sheet } from "@fortune-sheet/core";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { Button } from "antd";
import { useCallback, useRef, useState } from "react";
import styles from "./index.module.less";
import { exportExcel } from "../../utils/exportExcel";

/**
 * FortuneSheet https://ruilisi.github.io/fortune-sheet-docs/zh/
 * ExcelJS https://github.com/exceljs/exceljs/tree/master
 * @returns
 */
const ExportExcel = () => {
  const ref = useRef<WorkbookInstance>(null);

  const [excelData, setExcelData] = useState<Sheet[]>([{ name: "Sheet1", row: 25, column: 15 }]); // 表格数据

  /** 表格改变事件 */
  const handleChange = useCallback((data: any) => {
    console.log("data", data);
    setExcelData(data);
  }, []);

  /** 下载 */
  const handleDownload = async () => {
    exportExcel(excelData, "temp.xlsx");
  };

  return (
    <div className={styles.page}>
      <Button className={styles.btn} onClick={handleDownload} type="primary">
        下载
      </Button>

      <div className={styles.content}>
        <Workbook ref={ref} lang={"zh"} data={excelData} onChange={handleChange} />
      </div>
    </div>
  );
};

export default ExportExcel;
