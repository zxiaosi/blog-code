import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';

const BaseLayout = () => {
  const navigate = useNavigate();
  /** 点击事件 */
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
