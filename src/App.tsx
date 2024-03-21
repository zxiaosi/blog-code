import { generateRouter, routers } from './router';
import { useEffect, useState } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import { getLocal, setLocal } from './utils/auth';
import menusData from './apis/mock.json';

import './App.css';

function App() {
  const [menus, setMenus] = useState<any>([]); // 动态路由
  const [route, setRoute] = useState(routers); // 所有路由
  const element = useRoutes(route); // set的时候会重新渲染

  const location = useLocation();

  // 模拟请求: 建议使用 useSWR -- https://github.com/zxiaosi/react-springboot/blob/master/frontend/web/src/App.tsx
  useEffect(() => {
    const menuStorage = getLocal('menus') || []; // 这里给一个默认值，防止序列化报错

    if (menuStorage?.length == 0 && location.pathname != '/login') {
      // 当本地缓存中没有菜单且当前路由不是登录页的时候, 去请求接口
      setMenus(menusData); // 这里写请求
    } else {
      setMenus(menuStorage);
    }
  }, [location.pathname]);

  useEffect(() => {
    const newRoute = generateRouter(menus);
    setRoute(newRoute);
    menus?.length > 0 && setLocal('menus', menus);
  }, [menus]);

  // <></> 组件 -- https://react.dev/reference/react/Fragment
  return <>{element}</>;
}

export default App;
