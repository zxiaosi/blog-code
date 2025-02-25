import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  /** 点击事件 */
  const handleClick = (name: string) => {
    navigate(`/${name}`);
  };

  return (
    <div className="home">
      <h1>主应用</h1>

      <div className="btn-group">
        <button onClick={() => handleClick('app1')}>子应用 app1</button>
        <button onClick={() => handleClick('app2')}>子应用 app2</button>
      </div>

      <div className="children">
        <div id="subapp1"></div>
        <div id="subapp2"></div>
      </div>
    </div>
  );
};

/** 创建路由 */
const routes = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/app1/*',
      element: <Home />,
    },
    {
      path: '/app2/*',
      element: <Home />,
    },
  ],
  { basename: '/' }
);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
