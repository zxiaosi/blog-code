import { Button } from 'antd';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

/** 创建路由 */
const routes = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <>
          {/* 测试样式 */}
          <h2>app2</h2>
          <div className="test">测试样式隔离</div>
          <Button>测试组件库样式</Button>
        </>
      ),
    },
  ],
  { basename: '/app2' } // 设置路由前缀
);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
