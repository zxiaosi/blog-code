import { useLogData } from '@/hooks';
import { clearDataUtil } from '@/monitor/utils';
import { Button, Space } from 'antd';
import './index.less';

const CustomAction = () => {
  const getData = useLogData((state) => state.getData);

  /** 清空数据 */
  const handleClearData = async () => {
    await clearDataUtil();
    getData();
  };

  return (
    <div className="custom-action">
      <Space wrap>
        <Button type="primary">导入数据</Button>
        <Button type="primary">导出数据</Button>
        <Button type="primary" danger onClick={handleClearData}>
          清空数据
        </Button>
      </Space>
    </div>
  );
};

export default CustomAction;
