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
