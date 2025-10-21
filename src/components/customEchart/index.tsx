import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';
import './index.less';

const option = {
  title: {
    text: 'ECharts 入门示例',
  },
  tooltip: {},
  legend: {
    data: ['销量'],
  },
  grid: {
    bottom: '10%',
  },
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子'],
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20],
    },
  ],
};

const CustomEcharts = () => {
  const echartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(echartRef.current);
    myChart.setOption(option);
  }, []);

  return (
    <div className="custom-echarts">
      <div ref={echartRef} className="echart"></div>
    </div>
  );
};

export default CustomEcharts;
