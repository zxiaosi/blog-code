import CustomAction from '@/components/customAction';
import CustomData from '@/components/customData';
import CustomEchart from '@/components/customEchart';
import CustomError from '@/components/customError';
import CustomSize from '@/components/customSize';
import { useLogData } from '@/hooks';
import { unzipUtil } from '@/utils/recordScreen';
import { findCodeBySourceMapUtil } from '@/utils/sourcemap';
import { Button, message, Modal, Space, Table, Timeline } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import './index.less';

interface ModalDetail {
  open: boolean;
  type: 'revertCode' | 'playRecord' | 'revertBehavior';
  data: any;
}

const titleMap = {
  revertCode: '查看源码',
  playRecord: '播放录屏',
  revertBehavior: '用户行为',
};

const Home = () => {
  const [loading, data, getData] = useLogData(
    useShallow((state) => [state.loading, state.data, state.getData]),
  );

  const [modalDetail, setModalDetail] = useState<ModalDetail>({
    open: false,
    type: 'revertCode',
    data: null,
  });

  /**
   * 查看源码
   * - 先删除 node_modules/.vite 缓存
   * - 然后启动项目, 触发异常
   * - 最后再点击查看源码
   */
  const handleRevertCode = (record: any) => {
    findCodeBySourceMapUtil(record, (res: any) => {
      setModalDetail({ open: true, type: 'revertCode', data: res });
    });
  };

  /** 播放录屏 */
  const handlePlayRecord = (record: any) => {
    const resp = data.recordScreenList?.filter(
      (item) => item.recordScreenId === record.recordScreenId,
    );
    if (Array.isArray(resp) && resp[0] && resp[0]?.events) {
      const events = unzipUtil(resp[0]?.events);
      setModalDetail({ open: true, type: 'playRecord', data: events });
    } else {
      message.warning('暂无数据，请稍后重试~');
    }
  };

  /** 查看用户行为 */
  const handeRevertBehavior = (record: any) => {
    const newModalData = (record?.breadcrumb || []).map((item: any) => {
      const { time, status, category, data, message } = item;
      const color = status == 'ok' ? '#5FF713' : '#F70B0B';
      let content = '';
      switch (category) {
        case 'Click':
          content = `用户点击dom：${data}`;
          break;
        case 'Http':
          content = `调用接口：${data.url}, ${status == 'ok' ? '请求成功' : '请求失败'}`;
          break;
        case 'Code_Error':
          content = `代码报错：${data.message}`;
          break;
        case 'Resource_Error':
          content = `加载资源报错：${message}`;
          break;
        case 'Route':
          content = `路由变化：从 ${data.from}页面 切换到 ${data.to}页面`;
          break;
      }
      return {
        ...item,
        color,
        children: (
          <>
            <div>{dayjs(time).format('YYYY-MM-DD HH:mm:ss:SSS')}</div>
            <div>{content}</div>
          </>
        ),
      };
    });

    setModalDetail({ open: true, type: 'revertBehavior', data: newModalData });
  };

  /** 列表配置项 */
  const columns: ColumnsType = [
    {
      title: '报错时间',
      dataIndex: 'time',
      width: 200,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss:SSS'),
    },
    {
      title: '报错信息',
      dataIndex: 'message',
      width: 400,
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
      title: '用户ID',
      dataIndex: 'userId',
      width: 100,
    },
    {
      title: '浏览器信息',
      dataIndex: ['deviceInfo', 'browser'],
      width: 100,
    },
    {
      title: '操作系统',
      dataIndex: ['deviceInfo', 'os'],
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 220,
      render: (text, record) => {
        return (
          <Space wrap>
            <Button type="link" style={{ padding: 0 }} onClick={() => handleRevertCode(record)}>
              查看源码
            </Button>
            <Button type="link" style={{ padding: 0 }} onClick={() => handlePlayRecord(record)}>
              播放录屏
            </Button>
            <Button type="link" style={{ padding: 0 }} onClick={() => handeRevertBehavior(record)}>
              用户行为
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  /** 弹窗关闭事件 */
  const handleModalCancel = () => {
    setModalDetail({ open: false, type: 'revertCode', data: '' });
  };

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
          rowKey={'time'}
          bordered
          loading={loading}
          columns={columns}
          dataSource={data.errorList}
          scroll={{ x: true }}
          pagination={false}
        />
      </div>

      <Modal
        width={'80%'}
        open={modalDetail.open}
        title={titleMap[modalDetail.type]}
        onCancel={handleModalCancel}
        maskClosable={false}
        footer={null}
        rootClassName="modal"
      >
        {modalDetail.type === 'revertCode' && <></>}
        {modalDetail.type === 'playRecord' && <></>}
        {modalDetail.type === 'revertBehavior' && <Timeline items={modalDetail.data} />}
      </Modal>
    </div>
  );
};

export default Home;
