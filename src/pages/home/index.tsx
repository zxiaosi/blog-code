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
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { useShallow } from 'zustand/shallow';
import './index.less';

interface ModalDetail {
  open: boolean;
  type: 'revertCode' | 'playRecord' | 'revertBehavior';
  data: any;
}

/** 获取弹窗配置 */
const handleGetModalConfig = (modalDetail: ModalDetail) => {
  const { type, data } = modalDetail;

  switch (type) {
    case 'revertCode':
      return {
        title: '查看源码',
        width: '1072px',
        className: 'revert-code-modal',
        content: <div dangerouslySetInnerHTML={{ __html: data }}></div>,
      };
    case 'playRecord':
      return {
        title: '播放录屏',
        width: '1072px',
        className: 'play-record-modal',
        content: <div id="record-screen"></div>,
      };
    case 'revertBehavior':
      return {
        title: '用户行为',
        width: '1072px',
        className: 'revert-behavior-modal',
        content: <Timeline items={data} />,
      };
  }
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
    const resp = data.recordScreenList?.find(
      (item) => item.recordScreenId === record.recordScreenId,
    );

    if (resp && resp?.events) {
      const events = unzipUtil(resp?.events);
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
        const disabled = !data?.recordScreenList?.some(
          (item) => item.recordScreenId === record.recordScreenId,
        );
        return (
          <Space wrap>
            <Button type="link" style={{ padding: 0 }} onClick={() => handleRevertCode(record)}>
              查看源码
            </Button>
            <Button
              type="link"
              disabled={disabled}
              style={{ padding: 0 }}
              onClick={() => handlePlayRecord(record)}
            >
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

  /** 弹窗打开/关闭事件 */
  const handleAfterOpenChange = (open: boolean) => {
    if (open && modalDetail.type === 'playRecord') {
      new rrwebPlayer({
        target: document.querySelector('#record-screen')!, // customizable root element
        props: { events: modalDetail.data, UNSAFE_replayCanvas: true },
      });
    }
  };

  const modalConfig = handleGetModalConfig(modalDetail);

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
        open={modalDetail.open}
        width={modalConfig.width}
        title={modalConfig.title}
        maskClosable={false}
        footer={null}
        destroyOnHidden={true}
        rootClassName={`modal ${modalConfig.className}`}
        onCancel={handleModalCancel}
        afterOpenChange={handleAfterOpenChange}
      >
        {modalConfig.content}
      </Modal>
    </div>
  );
};

export default Home;
