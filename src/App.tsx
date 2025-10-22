import About from '@/pages/about';
import Home from '@/pages/home';
import BaseLayout from '@/pages/layout';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

/** 路由配置 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" />,
  },
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/about',
        element: <About />,
      },
    ],
  },
]);

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
