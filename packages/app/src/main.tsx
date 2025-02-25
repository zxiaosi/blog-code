import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerMicroApps, start } from 'qiankun';

/** 注册子应用 */
registerMicroApps(
  [
    {
      name: 'app1', // 子应用名称(全局唯一)
      entry: 'http://localhost:8001', // 这里的端口号要和子应用的端口号一致
      container: '#subapp1', // 子应用挂载点
      activeRule: '/app1', // 这里的路径要和子应用的路由路径一致
    },
    {
      name: 'app2', // 子应用名称(全局唯一)
      entry: 'http://localhost:8002', // 这里的端口号要和子应用的端口号一致
      container: '#subapp2', // 子应用挂载点
      activeRule: '/app2', // 这里的路径要和子应用的路由路径一致
    },
  ],
  {
    beforeLoad: async (app) => {
      console.log(`%c before load: ${app.name}`, 'color: green');
    },
    beforeMount: async (app) => {
      console.log(`%c before mount: ${app.name}`, 'color: green');
    },
    afterMount: async (app) => {
      console.log(`%c after mount: ${app.name}`, 'color: yellow');
    },
    beforeUnmount: async (app) => {
      console.log(`%c before unmount: ${app.name}`, 'color: red');
    },
    afterUnmount: async (app) => {
      console.log(`%c after unmount: ${app.name}`, 'color: red');
    },
  }
);

/** 启动子应用 */
start();

createRoot(document.getElementById('root')!).render(<App />);
