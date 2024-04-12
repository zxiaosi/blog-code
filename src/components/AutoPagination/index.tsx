import { Button, Spin, message } from "antd";
import styles from "./index.module.less";
import { useState } from "react";
import { outputPDF } from "../../utils/exportPdf";

/** 消息全局Key */
const messageKey = "globalMessageKey";

/** PDF内容宽度 */
const contentWidth = 560;

/** 自动分页PDF示例 */
const AutoPagination = () => {
  const [loading, setLoading] = useState(false);

  /** 下载 */
  const handleDownload = async () => {
    const header = document.getElementById("pdfHeader")!;
    const element = document.getElementById("pdfContent");
    const footer = document.getElementById("pdfFooter")!;

    if (element) {
      try {
        message.loading({ content: "导出中...", key: messageKey });
        setLoading(true);
        await outputPDF({ element, footer, header, contentWidth, filename: "自动分页.pdf" });
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
        <div className={styles.pdf} style={{ width: contentWidth * 2 }}>
          <div id="pdfHeader" className={styles.pdfHeader}></div>

          <div id="pdfContent" className={styles.pdfContent}>
            <div className="divide-inside" style={{ marginBottom: 40 }}>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
            </div>

            <div className="divide-inside" style={{ marginBottom: 40 }}>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
            </div>

            <div className="divide-inside" style={{ marginBottom: 40 }}>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
              <div>我是内容</div>
            </div>
          </div>

          <div id="pdfFooter" className={styles.pdfFooter}></div>
        </div>
      </Spin>
    </div>
  );
};

export default AutoPagination;
