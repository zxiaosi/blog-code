## 思路

- 主应用 `app` 有链接两个子应用 `app1` 和 `app2`

- 子应用 `app1` 可以通过 `loadMicroApp(app1)` 的方式打开子应用 `app2`

## 项目搭建

### 包版本

- `node`: `18.20.7`

- `npm`: `10.8.2`

- `lerna`: `8.1.8`

- `vite`: `6.1.0`

- `qiankun`: `2.10.16`

### 项目目录

```sh
├── 根目录
  ├── packages                        # 项目目录, 名称要跟 package.json 中 workspaces 以及 lerna.json 中 packages 一致
  ├── app                             # 主应用app
    ├── src
      ├── App.tsx                     # 路由配置文件
      ├── index.css                   # 样式文件
      ├── main.tsx                    # 项目入口文件
    ├── vite.config.ts                # vite 配置文件
  ├── app1                            # 子应用app1
    ├── src
      ├── App.tsx                     # 路由配置文件
      ├── index.css                   # 样式文件
      ├── main.tsx                    # 项目入口文件
    ├── vite.config.ts                # vite 配置文件
  ├── app2                            # 子应用app2
    ├── src
      ├── App.tsx                     # 路由配置文件
      ├── index.css                   # 样式文件
      ├── main.tsx                    # 项目入口文件
    ├── vite.config.ts                # vite 配置文件
  ├── lerna.json                      # lerna 配置文件
  ├── package.json                    # 全局配置文件
```

### 搭建 `monorepo` 项目 (可选)

- 通过 `npm install lerna -g` 全局安装 `lerna`

- 命令行执行 `npx lerna init` 初始化项目

- 配置项目

  {% tabs init %}

  <!-- tab lerna.json -->

  ```json
  {
    "npmClient": "npm", // 使用 npm
    "packages": ["packages/*"], // 指定包目录
    ... // 其他配置
  }
  ```

  <!-- endtab -->

  <!-- tab package.json -->

  ```json
  {
    "workspaces": ["packages/*"],
    ... // 其他配置
  }
  ```

  <!-- endtab -->

  {% endtabs %}

### 创建主/子应用

{% tabs create %}

<!-- tab 创建主应用 app -->

- 依次执行下面命令

  ```bash
  # 从根目录进入 packages 目录
  cd ./packages

  # 创建主应用 app
  npm create vite@latest

  # Project name
  app

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/app/vite.config.ts` 中配置 `启动端口`

  ```ts
  export default defineConfig({
    plugins: [react()],
    server: {
      port: 8000,
    },
  });
  ```

<!-- endtab -->

<!-- tab 创建子应用 app1 -->

- 依次执行下面命令

  ```bash
  # 从根目录进入 packages 目录
  cd ./packages

  # 创建子应用 app1
  npm create vite@latest

  # Project name
  app1

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/app1/vite.config.ts` 中配置 `启动端口`

  ```ts
  export default defineConfig({
    plugins: [react()],
    server: {
      port: 8001,
    },
  });
  ```

<!-- endtab -->

<!-- tab 创建子应用 app2 -->

- 依次执行下面命令

  ```bash
  # 从根目录进入 packages 目录
  cd ./packages

  # 创建子应用 app2
  npm create vite@latest

  # Project name
  app2

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/app2/vite.config.ts` 中配置 `启动端口`

  ```ts
  export default defineConfig({
    plugins: [react()],
    server: {
      port: 8002,
    },
  });
  ```

<!-- endtab -->

{% endtabs %}

### 启动项目

在根目录下执行 `npm install` 安装依赖

- 方式一：进入各个应用目录, 分别执行 `npm run dev`

  ```bash
  # 进入 packages/app 目录
  cd ./packages/app
  # 启动主应用
  npm run dev

  # 进入 packages/app1 目录
  cd ./packages/app1
  # 启动子应用
  npm run dev

  # 进入 packages/app2 目录
  cd ./packages/app2
  # 启动子应用
  npm run dev
  ```

- 方式二：进入根目录, 执行 `npm run dev -w=xxx`, `-w` 就是 `--workspace`, `xxx` 对应各个应用 `package.json` 的 `name`, 详见：[npm workspace](https://npm.nodejs.cn/cli/v9/using-npm/workspaces)

  ```bash
  # 根目录下启动主应用
  npm run dev -w=app

  # 根目录下启动子应用
  npm run dev -w=app1

  # 根目录下启动子应用
  npm run dev -w=app2
  ```

### 安装依赖项

- 全局安装 [react-router-dom](https://reactrouter.com/)

  ```bash
  # 在根目录下执行
  npm install react-router-dom -w=app -w=app1 -w=app2
  ```

- 主应用 `app` 和 子应用 `app1` 安装 [qiankun](https://qiankun.umijs.org/zh)

  ```bash
  # 在根目录下执行
  npm install qiankun -w=app -w=app1
  ```

- 子应用 `app1`、`app2` 安装 [vite-plugin-qiankun](https://www.npmjs.com/package/vite-plugin-qiankun)

  ```bash
  # 在根目录下执行
  npm install vite-plugin-qiankun -D -w=app1 -w=app2
  ```

### 链接主/子应用

{% tabs config %}

<!-- tab 主应用 app -->

- 在 `packages/app/src/main.tsx` 中注册并加载子应用

  ```tsx
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
  ```

- 在 `packages/app/src/App.tsx` 中配置路由, 并设置挂载子应用 `dom` 节点

  ```tsx
  import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useNavigate,
  } from 'react-router-dom';

  const BaseLayout = () => {
    const navigate = useNavigate();

    const handleClick = (name: string) => {
      navigate(`/${name}`);
    };

    return (
      <div className="home">
        <h1>主应用</h1>

        <div className="btn-group">
          <button onClick={() => handleClick('')}>主应用 app</button>
          <button onClick={() => handleClick('app1')}>子应用 app1</button>
          <button onClick={() => handleClick('app2')}>子应用 app2</button>
        </div>

        <div className="children">
          <Outlet />
        </div>
      </div>
    );
  };

  /** 创建路由 */
  const routes = createBrowserRouter(
    [
      {
        path: '/',
        element: <BaseLayout />,
        children: [
          {
            path: '/',
            element: <h2>app</h2>,
          },
          {
            path: 'app1/*', // 通配符 * 表示匹配所有子路由
            element: <div id="subapp1"></div>, // 子应用挂载点 对应 main.tsx 注册子应用的 container
          },
          {
            path: 'app2/*', // 通配符 * 表示匹配所有子路由
            element: <div id="subapp2"></div>, // 子应用挂载点 对应 main.tsx 注册子应用的 container
          },
        ],
      },
    ],
    { basename: '/' }
  );

  function App() {
    return <RouterProvider router={routes} />;
  }

  export default App;
  ```

- 在 `packages/app/src/index.css` 中配置样式

  ```css
  .home {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .btn-group {
    width: 300px;
    display: flex;
    justify-content: space-around;
  }

  .children {
    width: 100%;
    height: 400px;
    margin-top: 40px;
    border: 2px solid #000;
  }
  ```

<!-- endtab -->

<!-- tab 子应用 app1 -->

- 在 `packages/app1/vite.config.ts` 中配置 `跨域` 与 `vite-plugin-qiankun` 插件

  ```ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import qiankun from 'vite-plugin-qiankun';

  // https://vite.dev/config/
  export default ({ mode }) => {
    const useDevMode = mode === 'development';
    const host = '127.0.0.1';
    const port = 8001;
    const subAppName = 'app1';
    const base = useDevMode
      ? `http://${host}:${port}/${subAppName}`
      : `/${subAppName}`; // 这里 subAppName 对应 createBrowserRouter 的 basename

    return defineConfig({
      base,
      server: {
        port,
        cors: true, // 作为子应用时，如果不配置，则会引起跨域问题
        origin: `http://${host}:${port}`, // 必须配置，否则无法访问静态资源
      },
      plugins: [
        // 在开发模式下需要把react()关掉
        // https://github.com/tengmaoqing/vite-plugin-qiankun?tab=readme-ov-file#3dev%E4%B8%8B%E4%BD%9C%E4%B8%BA%E5%AD%90%E5%BA%94%E7%94%A8%E8%B0%83%E8%AF%95
        ...[useDevMode ? [] : [react()]],
        qiankun(subAppName, { useDevMode }),
      ],
    });
  };
  ```

- 在 `packages/app1/src/main.tsx` 中设置是否以子应用的方式启动

  ```tsx
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
    const app =
      container || (document.getElementById('root') as HTMLDivElement);
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
  ```

- 在 `packages/app1/src/App.tsx` 中配置路由

  ```tsx
  import { createBrowserRouter, RouterProvider } from 'react-router-dom';

  /** 创建路由 */
  const routes = createBrowserRouter(
    [
      {
        path: '/',
        element: <h2>app1</h2>,
      },
    ],
    { basename: '/app1' } // 设置路由前缀
  );

  function App() {
    return <RouterProvider router={routes} />;
  }

  export default App;
  ```

<!-- endtab -->

<!-- tab 子应用 app2 -->

- 在 `packages/app2/vite.config.ts` 中配置 `跨域` 与 `vite-plugin-qiankun` 插件

  ```ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import qiankun from 'vite-plugin-qiankun';

  // https://vite.dev/config/
  export default ({ mode }) => {
    const useDevMode = mode === 'development';
    const host = '127.0.0.1';
    const port = 8002;
    const subAppName = 'app2';
    const base = useDevMode
      ? `http://${host}:${port}/${subAppName}`
      : `/${subAppName}`; // 这里 subAppName 对应 createBrowserRouter 的 basename

    return defineConfig({
      base,
      server: {
        port,
        cors: true, // 作为子应用时，如果不配置，则会引起跨域问题
        origin: `http://${host}:${port}`, // 必须配置，否则无法访问静态资源
      },
      plugins: [
        // 在开发模式下需要把react()关掉
        // https://github.com/tengmaoqing/vite-plugin-qiankun?tab=readme-ov-file#3dev%E4%B8%8B%E4%BD%9C%E4%B8%BA%E5%AD%90%E5%BA%94%E7%94%A8%E8%B0%83%E8%AF%95
        ...[useDevMode ? [] : [react()]],
        qiankun(subAppName, { useDevMode }),
      ],
    });
  };
  ```

- 在 `packages/app2/src/main.tsx` 中设置是否以子应用的方式启动

  ```tsx
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
    const app =
      container || (document.getElementById('root') as HTMLDivElement);
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
  ```

- 在 `packages/app2/src/App.tsx` 中配置路由

  ```tsx
  import { createBrowserRouter, RouterProvider } from 'react-router-dom';

  /** 创建路由 */
  const routes = createBrowserRouter(
    [
      {
        path: '/',
        element: <h2>app2</h2>,
      },
    ],
    { basename: '/app2' } // 设置路由前缀
  );

  function App() {
    return <RouterProvider router={routes} />;
  }

  export default App;
  ```

<!-- endtab -->

{% endtabs %}

### 多个子应用共存

{% tabs multiple %}

<!-- tab 子应用 app1 -->

- 在 `packages/app1/src/App.tsx` 文件中添加点击事件, 通过 `loadMicroApp` 加载子应用 `app2`

  ```tsx
  import { loadMicroApp, MicroApp } from 'qiankun';
  import { useEffect, useRef } from 'react';
  import { createBrowserRouter, RouterProvider } from 'react-router-dom';

  const Home = () => {
    const microInstanceRef = useRef<MicroApp>(undefined);

    const handleClick = () => {
      microInstanceRef.current = loadMicroApp({
        name: 'app2', // 子应用名称(全局唯一)
        container: '#subapp2', // 子应用挂载点
        entry: 'http://localhost:8002', // 这里的端口号要和子应用的端口号一致
        props: { routerType: 'memory' }, // 设置路由类型为 memory
      });
    };

    useEffect(() => {
      return () => {
        microInstanceRef.current?.unmount(); // 卸载子应用
      };
    }, []);

    return (
      <>
        <h2>app1</h2>
        <button onClick={handleClick}>加载子应用app2</button>

        <div className="other-subapp">
          {/* 子应用挂载点 */}
          <div id="subapp2"></div>
        </div>
      </>
    );
  };

  /** 创建路由 */
  const routes = createBrowserRouter(
    [
      {
        path: '/',
        element: <Home />,
      },
    ],
    { basename: '/app1' } // 设置路由前缀
  );

  function App() {
    return <RouterProvider router={routes} />;
  }

  export default App;
  ```

- 在 `packages/app1/src/index.css` 中配置样式

  ```css
  .other-subapp {
    margin-top: 40px;
    width: 100%;
    height: 200px;
    border: 2px solid red;
  }
  ```

<!-- endtab -->

<!-- tab 子应用 app2 -->

- 在 `packages/app2/src/main.tsx` 文件中添加 `props` 处理

  ```tsx
  import { createRoot } from 'react-dom/client';
  import {
    QiankunProps,
    qiankunWindow,
    renderWithQiankun,
  } from 'vite-plugin-qiankun/dist/helper';
  import App from './App.tsx';
  import './index.css';

  /** 渲染函数 */
  const render = (container?: HTMLElement, props: any = {}) => {
    const app =
      container || (document.getElementById('root') as HTMLDivElement);
    createRoot(app).render(<App {...props} />);
  };

  /** Qiankun 生命周期钩子 */
  const qiankun = () => {
    renderWithQiankun({
      bootstrap() {},
      async mount(props: QiankunProps) {
        const { container, ...rest } = props;
        render(container, rest);
      },
      update: () => {},
      unmount: () => {},
    });
  };

  // 检查是否在 Qiankun 环境中
  console.log('qiankunWindow', qiankunWindow.__POWERED_BY_QIANKUN__);

  if (qiankunWindow.__POWERED_BY_QIANKUN__) qiankun(); // 以子应用的方式启动
  else render();
  ```

- 在 `packages/app2/src/App.tsx` 文件中添加三种路由加载模式 `hash`、`browser`、`memory` 的判断

  ```tsx
  import { useMemo } from 'react';
  import {
    createBrowserRouter,
    createHashRouter,
    createMemoryRouter,
    RouteObject,
    RouterProvider,
  } from 'react-router-dom';

  // 设置路由前缀
  const basename = '/app2';

  /** 路由配置 */
  const router: RouteObject[] = [
    {
      path: '/',
      element: <h2>app2</h2>,
    },
  ];

  function App(props: any) {
    const { routerType } = props;

    const routers = useMemo(() => {
      switch (routerType) {
        case 'hash':
          return createHashRouter(router, { basename });
        case 'memory':
          return createMemoryRouter(router, {
            basename,
            initialEntries: ['/app2'], // 初始化时指定初始路径, 用户可以通过浏览器前进后退操作
            initialIndex: 0, // 初始化时指定初始索引
          });
        default:
          return createBrowserRouter(router, { basename });
      }
    }, [routerType]);

    return <RouterProvider router={routers} />;
  }

  export default App;
  ```

- 关于路由模式参考: [React Router Dom 中的三种路由及其使用场景](https://juejin.cn/post/7369097402501398568)

<!-- endtab -->

{% endtabs %}
