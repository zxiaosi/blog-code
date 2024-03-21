import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import * as Icons from "@ant-design/icons";
import React from "react";
import IsAuth from "./isAuth";
// 参考 https://juejin.cn/post/7132393527501127687

const LAYOUT_PAGE = "layout";

/** 导入指定文件下的路由模块 */
const modules = import.meta.glob("../views/**/*.tsx");
console.log("modules", modules);

/** 异步懒加载组件 */
const lazyLoad = (moduleName: string) => {
  // 根据模块名匹配对应的组件
  const Module = lazy(modules[`../views${moduleName}/index.tsx`] as any);

  return (
    <Suspense fallback={<div>loading...</div>}>
      <Module />
    </Suspense>
  );
};

/** 动态创建Icon */
const dynamicIcon = (icon: string) => {
  const antIcon: { [key: string]: any } = Icons; // 防止类型报错
  return React.createElement(antIcon[icon]);
};

/** 静态路由 */
export const routers: any[] = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace={true} />,
  },
  {
    path: "/login",
    meta: { title: "登录" },
    element: lazyLoad("/login"),
  },
  {
    path: "/",
    id: LAYOUT_PAGE, // 判断是否插入动态路由的标识
    element: <IsAuth>{lazyLoad("/" + LAYOUT_PAGE)}</IsAuth>,
  },
  {
    path: "*",
    meta: { title: "404" },
    element: lazyLoad("/error"),
  },
];

/** 生成菜单 */
export const generateMenu = (data: any) => {
  const result: any = [];

  data.forEach((item: any, index: number) => {
    result.push({
      key: item.menuUrl,
      label: item.name,
      icon: dynamicIcon(item.icon),
    });

    if (item.children.length > 0) result[index].children = generateMenu(item.children);
  });

  return result;
};

/** 迭代动态路由 */
const iterateRouter = (data: any) => {
  const result: any[] = [];

  // 动态路由
  data?.forEach((item: any, index: number) => {

    result.push({
      path: item.menuUrl,
      meta: { title: item.name, icon: item.icon },
      element: lazyLoad("/" + LAYOUT_PAGE + item.menuUrl),
    });

    if (item.children?.length > 0) result[index].children = iterateRouter(item.children);
  });


  return result;
};

/** 生成路由  */
export const generateRouter = (data: any) => {
  // 1. 迭代动态路由
  const dynamicRouters = data ? iterateRouter(data) : [];

  // 2. 合并所有路由 = 动态路由 + 静态路由
  const idx = routers.findIndex((item: any) => item.id == LAYOUT_PAGE);
  routers[idx].children = [...dynamicRouters];

  return routers.slice(); // 注意这里要浅拷贝返回一个新的数组，否则会报错
};

