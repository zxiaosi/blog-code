import mockData from "@/apis/mock.json";
import { getLocal, setLocal } from "@/utils/auth";
import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from "vue-router";

const LayoutPage = "Layout"; // 布局页

const modules = import.meta.glob("@/views/pages/**/*.vue"); // 获取 views/home/ 下的vue文件

// 静态路由
const staticRoutes = [
  { path: "/", redirect: "/dashboard" }, // 重定向
  {
    path: "/login",
    meta: { title: "登录" },
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/",
    name: LayoutPage, // 路由名称, 用于添加动态路由 (详见: https://router.vuejs.org/zh/guide/advanced/dynamic-routing.html#%E6%B7%BB%E5%8A%A0%E5%B5%8C%E5%A5%97%E8%B7%AF%E7%94%B1)
    component: () => import(`@/views/${LayoutPage}.vue`),
  },
  {
    path: "/:pathMatch(.*)*",
    meta: { title: "404" },
    component: () => import("@/views/404.vue"),
  },
];

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
});

/**
 * 路由守卫
 */
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {

  document.title = `${to.meta.title} | Demo`; // 页面名

  if (getLocal("token")) { // 检查是否存在token, 不存在则用户登录状态失效

    if (to.path == "/login") {
      next();
    } else {
      const menusStorage = getLocal("menus") || [];

      // 用户已登录
      if (menusStorage.length > 0) {
        if (router.getRoutes().length == staticRoutes.length) { // 如果路由表中的路由数量等于静态路由的数量, 则添加动态路由 (防止重复添加动态路由)
          mergeRoutes(menusStorage, router); // 从缓存中获取菜单列表
          next({ ...to, replace: true }); // 确保 addRoutes 已完成
        } else {
          next();
        }
      } else {

        const menusData = mockData; // 替换为真实接口
        setLocal("menus", menusData); // 存储到本地缓存中
        if (menusData.length > 0) {
          mergeRoutes(menusData, router); // 添加动态路由
          next({ ...to, replace: true });
        } else {
          throw new Error("菜单列表为空");
        }

      }

    }

  } else { // 用户未登录 (防止无限重定向)

    if (to.path == "/login") { // 如果用户访问的是登录页, 直接放行
      next();
    } else { // 如果用户访问的不是登录页, 则重定向到登录页
      next("/login");
    }

  }

});

/**
 * 组装菜单列表
 * @param data 菜单列表
 */
export const iterateMenu = (data: any) => {
  let result: any = [];

  data.forEach((item: any, index: number) => {
    result.push({
      path: item.menuUrl,
      meta: { title: item.name, icon: item.icon },
      component: modules[`/src/views/pages${uriToFileName(item.menuUrl)}.vue`],
    });

    if (item.children.length > 0) result[index].children = iterateMenu(item.children);
  });

  return result;
};

/**
 * 获取路由对应的文件名 eg: /user => User | /home/user => /home/User
 * @param uri 路由地址
 * @returns 文件名
 */
export const uriToFileName = (uri: string) => {
  let strList = uri.split("/");
  let fileName = strList[strList.length - 1];
  let prefix = uri.replace(fileName, "");
  return `${prefix + fileName[0]?.toUpperCase() + fileName?.slice(1)}`;
};

/**
   * 添加动态路由，并同步到状态管理器中
   * @param menus 路由列表
   * @param router 路由实例
   */
export const mergeRoutes = (menus: any, router: any) => {
  // 动态路由
  const dynamicMenu = iterateMenu(menus);

  // 添加到指定路径下得动态路由
  dynamicMenu.forEach((item: any) => router.addRoute("Layout", item));

  /**
   * router.getRoutes() 获取的是所有路由，扁平化输出，看不到嵌套的路由，但实际有嵌套的路由
   * 详见: https://github.com/vuejs/router/issues/600
   */
  // console.log("router", router.getRoutes());
}

export default router;
