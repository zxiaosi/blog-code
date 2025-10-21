import CustomAction from '@/components/customAction';
import CustomData from '@/components/customData';
import CustomEchart from '@/components/customEchart';
import CustomError from '@/components/customError';
import CustomSize from '@/components/customSize';
import { useLogData } from '@/hooks';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useShallow } from 'zustand/shallow';
import './index.less';

const Home = () => {
  const [loading, data] = useLogData(useShallow((state) => [state.loading, state.data]));

  /** 列表配置项 */
  const columns: ColumnsType = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: '报错时间',
      dataIndex: 'time',
      width: 150,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '报错信息',
      dataIndex: 'message',
    },
    {
      title: '报错页面',
      dataIndex: 'pageUrl',
      width: 100,
    },
    {
      title: '项目编号',
      dataIndex: 'apikey',
      width: 100,
    },
    {
      title: '用户id',
      dataIndex: 'userId',
      width: 100,
    },
    {
      title: '浏览器信息',
      dataIndex: ['deviceInfo', 'browser'],
      width: 150,
    },
    {
      title: '操作系统',
      dataIndex: ['deviceInfo', 'os'],
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 120,
      render: (text, record) => (
        <a href={record.pageUrl} target="_blank">
          查看
        </a>
      ),
    },
  ];

  return (
    <div className="home">
      <div className="home-top">
        <div className="home-top-left">
          <CustomSize />
          <CustomAction />
          <CustomData />
          <CustomError />
        </div>

        <div className="home-top-right">
          <CustomEchart />
        </div>
      </div>

      <div className="home-bottom">
        <Table
          loading={loading}
          columns={columns}
          dataSource={data.errorList}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default Home;
