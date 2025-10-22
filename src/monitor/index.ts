import { useLogData } from '@/hooks';
import webSee from '@websee/core';
import recordscreen from '@websee/recordscreen';
import { clearDataUtil, exportDataUtil, writeDataUtil } from './utils';

/**
 * 监控sdk
 * @see https://github.com/xy-sea/web-see
 * - 拷贝整个 src/monitor 目录到项目中, 并在 main.tsx 中引入 monitor/index.ts
 * - 安装 websee 相关包: npm install @websee/core @websee/performance @websee/recordscreen
 * - 安装 idb-keyval 相关包: npm install idb-keyval
 */
webSee.init({
  dsn: '/api/monitor', // 上报接口地址
  apikey: 'Demo', // 项目标识
  userId: window?.sdk?.userId || '-', // 用户标识
  silentWhiteScreen: false, // 白屏检测
  skeletonProject: false, // 骨架屏检测
  repeatCodeError: true, // 是否开启去除重复的代码报错，开启的话重复的代码错误只上报一次
  handleHttpStatus(data) {
    let { url, response } = data;
    // code为200，接口正常，反之亦然
    let { code } = typeof response === 'string' ? JSON.parse(response) : response;
    if (url.includes('/getErrorList')) {
      return code === 200 ? true : false;
    } else {
      return true;
    }
  },
  // @ts-ignore
  beforeDataReport(data) {
    console.log('beforeDataReport', data);

    writeDataUtil(data)
      .then(() => {
        useLogData.getState().getData();
      })
      .catch((e) => {
        console.log('beforeDataReport error', e);
      });

    return false; // 返回 false, 不上报
    // return { ...data };
  },
});
// webSee.use(performance, {}); // 性能监控插件
webSee.use(recordscreen, {}); // 录屏插件

/**
 * 在 window 定义 monitor 变量
 * - 通过 await window.monitor.download() 导出数据
 * - 通过 await window.monitor.clear() 清空数据
 */
if (!window.monitor) {
  Object.defineProperty(window, 'monitor', {
    value: {
      download: exportDataUtil,
      clear: clearDataUtil,
    },
    writable: false, // 不允许修改
    configurable: false, // 不允许删除
  });
}
