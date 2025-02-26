import { Button, ConfigProvider } from 'antd';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

/** 创建路由 */
const routes = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <>
          {/* 测试样式 */}
          <h2>app1</h2>
          <div className="test">测试样式隔离</div>
          <Button>测试组件库样式</Button>
        </>
      ),
    },
  ],
  { basename: '/app1' } // 设置路由前缀
);

function App() {
  return (
    // 设置组件库样式前缀
    <ConfigProvider prefixCls="app1">
      <RouterProvider router={routes} />
    </ConfigProvider>
  );
}

export default App;
