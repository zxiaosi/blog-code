import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerMicroApps, start } from 'qiankun';

/** 注册子应用 */
registerMicroApps(
  [
    {
      name: 'app1',
      entry: 'http://localhost:8001',
      container: '#subapp1',
      activeRule: '/app1',
    },
    {
      name: 'app2',
      entry: 'http://localhost:8002',
      container: '#subapp2',
      activeRule: '/app2',
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
