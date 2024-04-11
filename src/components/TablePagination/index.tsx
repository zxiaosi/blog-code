import { Button, Spin, Table, TableProps, message } from "antd";
import styles from "./index.module.less";
import { useMemo, useState } from "react";
import { outputPDF } from "../../utils/exportPdf";

/** 消息全局Key */
const messageKey = "globalMessageKey";

/** PDF内容宽度 */
const contentWidth = 560;

interface RecordType {
  id: number;
  firstName: string;
  lastName: string;
}

/** 表格列配置 */
const columns: TableProps<RecordType>["columns"] = [
  { title: "ID", dataIndex: "id", width: 100 },
  { title: "FistName", dataIndex: "firstName", width: 120 },
  { title: "LastName", dataIndex: "lastName", width: 120 },
];

/** 假数据 */
const getData = (count: number) => {
  const data: RecordType[] = new Array(count).fill(null).map((_, index) => ({
    id: index,
    firstName: `First_${index.toString(16)}`,
    lastName: `Last_${index.toString(16)}`,
  }));

  return data;
};

/** 表格分页PDF示例 */
const AutoPagination = () => {
  const [loading, setLoading] = useState(false);

  const data = useMemo(() => getData(100), []);

  /** 下载 */
  const handleDownload = async () => {
    const header = document.getElementById("pdfHeader")!;
    const element = document.getElementById("pdfContent");
    const footer = document.getElementById("pdfFooter")!;

    if (element) {
      try {
        message.loading({ content: "导出中...", key: messageKey });
        setLoading(true);
        await outputPDF({ element, footer, header, contentWidth, filename: "表格分页.pdf" });
        setLoading(false);
        message.success({ content: "导出成功！", key: messageKey });
      } catch (error) {
        setLoading(false);
        message.error({ content: "导出失败！", key: messageKey });
      }
    }
  };

  return (
    <div className={styles.page}>
      <Button type="primary" className={styles.btn} onClick={handleDownload}>
        下载
      </Button>

      <Spin spinning={loading}>
        {/* 不设置宽度, 默认以 父元素的的宽度 为 PDF宽度   */}
        <div className={styles.pdf}>
          <div id="pdfHeader" className={styles.pdfHeader}></div>

          <div id="pdfContent" className={styles.pdfContent}>
            {/* table行类名 .ant-table-row */}
            <Table virtual bordered rowKey="id" columns={columns} dataSource={data} pagination={false} />
          </div>

          <div id="pdfFooter" className={styles.pdfFooter}></div>
        </div>
      </Spin>
    </div>
  );
};

export default AutoPagination;
