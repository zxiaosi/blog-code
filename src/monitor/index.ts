import webSee from '@websee/core';
import performance from '@websee/performance';
import recordscreen from '@websee/recordscreen';

/**
 * 监控sdk
 * @see https://github.com/xy-sea/web-see
 * - 拷贝整个 src/monitor 目录到项目中, 并在 main.tsx 中引入 monitor/index.ts
 * - 安装 websee 相关包: npm install @websee/core @websee/performance @websee/recordscreen
 * - 安装 idb-keyval 相关包: npm install idb-keyval
 */
webSee.init({
  dsn: '/api/monitor',
  apikey: 'Demo',
  userId: window.sdk.userId || '-',
  disabled: false, // 是否禁用sdk
  silentWhiteScreen: false, // 白屏检测
  skeletonProject: false, // 骨架屏检测
  whiteBoxElements: ['html', 'body', '#app', '#root'], // 白屏检测的容器列表
  filterXhrUrlRegExp: undefined, // 默认为空，所有的接口请求都会被监听
  useImgUpload: false, // 是否使用图片打点上报的方式
  throttleDelayTime: 0, // 设置全局 click 点击事件的节流时间
  overTime: 10, // 设置接口超时时长，默认 10s
  maxBreadcrumbs: 20, // 用户行为存放的最大容量，超过 20 条，最早的一条记录会被覆盖掉
  repeatCodeError: true, // 是否开启去除重复的代码报错，开启的话重复的代码错误只上报一次
  // beforePushBreadcrumb () {},
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
  async beforeDataReport(data) {
    console.log('beforeDataReport', data);

    return false; // 返回 false, 不上报
    // return { ...data };
  },
});
webSee.use(performance, {}); // 性能监控插件
webSee.use(recordscreen, {}); // 录屏插件

/**
 * 在 window 定义 monitor 变量
 * - 通过 await window.monitor.download() 导出数据
 * - 通过 await window.monitor.clear() 清空数据
 */
if (!window.monitor) {
  Object.defineProperty(window, '', {
    value: {
      download: 'demo',
      clear: 'demo',
    },
    writable: false, // 不允许修改
    configurable: false, // 不允许删除
  });
}
