import { createBrowserRouter, RouterProvider } from 'react-router';

function App({ appName = '' }) {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: <>子应用app</>,
      },
    ],
    {
      basename: `/${appName}`,
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
