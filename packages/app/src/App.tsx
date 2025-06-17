import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from 'react-router';

function App({ loading }: any) {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: (
          <>
            <div style={{ fontSize: 24 }}>主应用app</div>

            <Link to={'/'}>回首页</Link>

            <Link to={'/app1'} style={{ margin: '0 20px' }}>
              子应用app
            </Link>

            <Link to={'/test'}>子模块test</Link>

            {loading && <div>loading...</div>}
            <Outlet />
            <main id="sub-app"></main>
          </>
        ),
        children: [
          {
            path: 'app1/*',
            element: <></>,
          },
          {
            path: 'test',
            element: <div>test</div>,
          },
        ],
      },
    ],
    {
      basename: '/',
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
