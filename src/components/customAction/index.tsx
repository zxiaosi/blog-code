import { useLogData } from '@/hooks';
import { clearDataUtil, exportDataUtil } from '@/monitor/utils';
import { Button, Space } from 'antd';
import './index.less';

const CustomAction = () => {
  const getData = useLogData((state) => state.getData);

  /** 导入数据 */
  const handleImportData = () => {};

  /** 导出数据 */
  const handleExportData = async () => {
    await exportDataUtil();
  };

  /** 清空数据 */
  const handleClearData = async () => {
    await clearDataUtil();
    getData();
  };

  return (
    <div className="custom-action">
      <Space wrap>
        <Button type="primary" onClick={handleImportData}>导入数据</Button>
        <Button type="primary" onClick={handleExportData}>
          导出数据
        </Button>
        <Button type="primary" danger onClick={handleClearData}>
          清空数据
        </Button>
      </Space>
    </div>
  );
};

export default CustomAction;
