import { useLogData } from '@/hooks';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Popover, Space, Statistic, StatisticProps, Tag } from 'antd';
import CountUp from 'react-countup';
import './index.less';

const formatter: StatisticProps['formatter'] = (value) => <CountUp end={value as number} />;

const content = (
  <div className="popover-content">
    <Space direction="vertical">
      <div>
        1. 页面初始化时, 会记录 <Tag>白屏数据</Tag> 和 <Tag>性能数据</Tag>, 导致多次刷新, 正常行为
      </div>
      <div>
        2. <Tag>录屏数据</Tag> 会在 <Tag>0 ~ 30s</Tag> 内生成. 页面不操作时, 页面刷新, 正常行为
      </div>
      <div>
        3. <Tag>录屏数据</Tag> 是捕获 <Tag>鼠标</Tag> 操作. 触发错误事件之后, 鼠标不移动,
        录屏数据会一直等待, 直到鼠标移动, 才会停止, 并生成 <Tag>录屏数据</Tag>
      </div>
      <div>
        4. <Tag>录屏数据</Tag> 是捕获 <Tag>鼠标</Tag> 操作. 短时间内频繁触发事件, 比如说{' '}
        <Tag>Hover</Tag> 事件, 会导致 <Tag>录屏数据</Tag> 体积过大
      </div>
    </Space>
  </div>
);

const CustomSize = () => {
  const size = useLogData((state) => state.size);

  return (
    <div className="custom-size">
      <Space wrap>
        <Popover title="" content={content}>
          <QuestionCircleOutlined />
        </Popover>
        <Statistic
          prefix="日志总大小："
          value={size}
          suffix="B"
          formatter={formatter} // 会触发 performance - longTask
        />
        -
        <Statistic
          value={size / 1024}
          suffix="KB"
          formatter={formatter} // 会触发 performance - longTask
        />
        -
        <Statistic
          value={size / 1024 / 1024}
          suffix="MB"
          formatter={formatter} // 会触发 performance - longTask
        />
      </Space>
    </div>
  );
};

export default CustomSize;
