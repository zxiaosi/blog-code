import { useLogData } from '@/hooks';
import { clearDataUtil, CUSTOM_STORAGE, exportDataUtil, LogData } from '@/monitor/utils';
import { Button, Space, Upload, UploadProps } from 'antd';
import { setMany } from 'idb-keyval';
import { useShallow } from 'zustand/shallow';
import './index.less';

/** 读取文件 */
const handleReadFile = async (file: any) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (resp) => {
      const result = resp.target?.result;
      return resolve(result);
    };

    reader.onerror = (err) => {
      console.log('handleReadFile', err);
      resolve('{}');
    };

    reader.readAsText(file);
  });
};

const CustomAction = () => {
  const [loading, getData] = useLogData(useShallow((state) => [state.loading, state.getData]));

  /** 刷新数据 */
  const handleRefreshData = async () => {
    await getData();
  };

  /** 导入数据 */
  const handleImportData: UploadProps['customRequest'] = async (info) => {
    const { file } = info;
    const result = await handleReadFile(file);
    const resultArr: LogData[] = JSON.parse(typeof result === 'string' ? result : '[]');
    const data = resultArr.map((item) => [item.createTime + '', item]) as any;
    await setMany(data, CUSTOM_STORAGE);
    await getData();
  };

  /** 导出数据 */
  const handleExportData = async () => {
    await exportDataUtil();
  };

  /** 清空数据 */
  const handleClearData = async () => {
    await clearDataUtil();
    await getData();
  };

  return (
    <div className="custom-action">
      <Space wrap>
        <Button loading={loading} onClick={handleRefreshData}>
          刷新数据
        </Button>
        <Upload showUploadList={false} customRequest={handleImportData} accept=".json" maxCount={1}>
          <Button type="primary" loading={loading}>
            导入数据
          </Button>
        </Upload>
        <Button type="primary" loading={loading} onClick={handleExportData}>
          导出数据
        </Button>
        <Button type="primary" loading={loading} danger onClick={handleClearData}>
          清空数据
        </Button>
      </Space>
    </div>
  );
};

export default CustomAction;
