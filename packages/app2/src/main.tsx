import { createRoot } from 'react-dom/client';
import {
  QiankunProps,
  qiankunWindow,
  renderWithQiankun,
} from 'vite-plugin-qiankun/dist/helper';
import App from './App.tsx';
import './index.css';

/** 渲染函数 */
const render = (container?: HTMLElement) => {
  const app = container || (document.getElementById('root') as HTMLDivElement);
  createRoot(app).render(<App />);
};

/** Qiankun 生命周期钩子 */
const qiankun = () => {
  renderWithQiankun({
    bootstrap() {},
    async mount(props: QiankunProps) {
      render(props.container);
    },
    update: () => {},
    unmount: () => {},
  });
};

// 检查是否在 Qiankun 环境中
console.log('qiankunWindow', qiankunWindow.__POWERED_BY_QIANKUN__);

if (qiankunWindow.__POWERED_BY_QIANKUN__) qiankun(); // 以子应用的方式启动
else render();
