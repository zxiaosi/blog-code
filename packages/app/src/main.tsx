import { registerMicroApps, start } from 'qiankun';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

const render = (props: any) => root.render(<App {...props} />);

render({ loading: false });
const loader = (loading: boolean) => render({ loading });

/** 注册子应用 */
registerMicroApps(
  [
    {
      name: 'app1',
      entry: 'http://localhost:8001',
      container: '#sub-app',
      activeRule: '/app1',
      props: {
        appName: 'app1',
      },
      loader,
    },
  ],
  {
    beforeLoad: [
      async (app) => {
        console.log('[LifeCycle] before load %c%s', 'color: green;', app.name);
      },
    ],
    beforeMount: [
      async (app) => {
        console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name);
      },
    ],
    afterUnmount: [
      async (app) => {
        console.log(
          '[LifeCycle] after unmount %c%s',
          'color: green;',
          app.name
        );
      },
    ],
  }
);

start();
