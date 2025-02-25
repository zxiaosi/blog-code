import { createBrowserRouter, RouterProvider } from 'react-router-dom';

/** 创建路由 */
const routes = createBrowserRouter(
  [
    {
      path: '/',
      element: <h1>app2</h1>,
    },
  ],
  { basename: '/app2' }
);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
