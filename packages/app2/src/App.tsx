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
