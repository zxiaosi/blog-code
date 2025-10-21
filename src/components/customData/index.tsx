import { Button, Space } from 'antd';
import './index.less';

const CustomData = () => {
  return (
    <div className="custom-data">
      <Space wrap>
        <Button type="primary">性能数据</Button>
        <Button type="primary">白屏检测数据</Button>
      </Space>
    </div>
  );
};

export default CustomData;
