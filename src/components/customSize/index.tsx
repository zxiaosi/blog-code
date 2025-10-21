import { useLogData } from '@/hooks';
import { Statistic, StatisticProps } from 'antd';
import CountUp from 'react-countup';
import './index.less';

const formatter: StatisticProps['formatter'] = (value) => <CountUp end={value as number} />;

const CustomSize = () => {
  const size = useLogData((state) => state.size);

  return (
    <div className="custom-size">
      <Statistic prefix="日志总大小:&nbsp;" value={size} suffix="B" formatter={formatter} />

      <Statistic prefix="&nbsp;-&nbsp;" value={size / 1024} suffix="KB" formatter={formatter} />

      <Statistic
        prefix="&nbsp;-&nbsp;"
        value={size / 1024 / 1024}
        precision={4}
        suffix="MB"
        formatter={formatter}
      />
    </div>
  );
};

export default CustomSize;
